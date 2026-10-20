import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import ScheduleBlock from '../../src/lib/components/ScheduleBlock.svelte';
import ScheduleGrid from '../../src/lib/components/ScheduleGrid.svelte';
import SessionCard from '../../src/lib/components/SessionCard.svelte';
import {
    buildVisibleGridState,
    clampStartColumnIndex,
    createGridAreaId,
    flattenAndSortSessions,
    getEndPath,
    gridTemplateAreas,
    nextStartColumnIndex,
    previousStartColumnIndex,
    updateGridIds,
    visibleColumnCountForWidth,
} from '../../src/lib/components/schedule.ts';
import type {
    ParsedConference,
    ParsedSession,
    Schedule,
    Speaker,
    TrackWithSessions,
} from '../../src/lib/types.ts';

vi.mock('$app/state', () => ({
    page: {
        data: {
            cmsPublicUrl: 'https://cms-public.example.test/',
            mediaPublicUrl: 'https://media.example.test/',
        },
    },
}));

const ada = {
    contentType: 'speaker',
    name: 'Ada',
    route: { path: '/speakers/ada/' },
    properties: {
        jobTitle: 'Developer',
        profileImage: [{ url: '/media/ada.jpg' }],
    },
} as unknown as Speaker;
const ben = { contentType: 'speaker', name: 'Ben' } as Speaker;

const makeSession = (
    id: string,
    time: string,
    speakers: Speaker[] = [ada],
    markup = '<p>Details</p>',
): ParsedSession =>
    ({
        id,
        contentType: 'session',
        name: id,
        route: { path: `/sessions/${id}/` },
        properties: {
            start: new Date(`2024-10-12T${time}:00.000Z`),
            speakers,
            description: markup ? { markup } : null,
        },
    }) as unknown as ParsedSession;

const first = makeSession('a', '13:30', [ada, ben]);
const second = makeSession('b', '14:40');
const workshop = makeSession('w', '13:30');
const lunch = makeSession('lunch', '17:00', []);
const tracks = [
    { id: 't1', contentType: 'track', name: 'One', children: [second, first] },
    { id: 't2', contentType: 'track', name: 'Two', children: [] },
    { id: 't3', contentType: 'track', name: 'Workshop', children: [workshop] },
] as unknown as TrackWithSessions[];
const grid = [
    ['breakfast', 'breakfast', 'breakfast'],
    ['a', 'x', 'w'],
    ['b', 'y', 'w'],
    ['c', 'z', null],
];
const conference = {
    properties: { date: new Date('2024-10-12T05:00:00.000Z') },
} as ParsedConference;
const schedule: Schedule = { items: [...tracks, lunch], grid };

describe('schedule helpers', () => {
    it('maps route tails and empty cells to grid areas', () => {
        expect(createGridAreaId('w/')).toBe('area-w');
        expect(getEndPath('/sessions/lunch/')).toBe('lunch');
        expect(updateGridIds([[null, '', 'lunch']])).toEqual([
            ['...', '...', 'area-lunch'],
        ]);
    });

    it('slices tracks and preserves rectangular duplicate areas', () => {
        const visible = buildVisibleGridState({
            rows: grid,
            tracks,
            startColumnIndex: 1,
            visibleColumns: 2,
        });
        expect(visible.visibleTracks.map((track) => track.name)).toEqual([
            'Two',
            'Workshop',
        ]);
        expect(visible.visibleGrid).toEqual([
            ['area-track-header', 'area-track-header'],
            ['area-breakfast', 'area-breakfast'],
            ['area-x', 'area-w'],
            ['area-y', 'area-w'],
            ['area-z', '...'],
        ]);
        expect(gridTemplateAreas(visible.visibleGrid)).toContain(
            '"area-y area-w"',
        );
    });

    it('matches responsive breakpoints and clamps controls', () => {
        expect(visibleColumnCountForWidth(1023, 3)).toBe(1);
        expect(visibleColumnCountForWidth(1024, 3)).toBe(2);
        expect(visibleColumnCountForWidth(1279, 3)).toBe(2);
        expect(visibleColumnCountForWidth(1280, 3)).toBe(3);
        expect(visibleColumnCountForWidth(1280, 2)).toBe(2);
        expect(nextStartColumnIndex(1, 3, 2)).toBe(1);
        expect(previousStartColumnIndex(0)).toBe(0);
        expect(clampStartColumnIndex(2, 3, 2)).toBe(1);
    });

    it('sorts track children and top-level sessions chronologically', () => {
        expect(
            flattenAndSortSessions(schedule.items).map((item) => item.id),
        ).toEqual(['a', 'w', 'b', 'lunch']);
    });
});

describe('schedule SSR components', () => {
    it('renders the section, date, tracks, and initial three-column grid', () => {
        const html = render(ScheduleBlock, {
            props: { conference, schedule },
        }).body;
        expect(html).toContain('id="schedule"');
        expect(html).toContain('>Schedule</h2>');
        expect(html).toContain('Saturday, October 12th, 2024');
        for (const track of tracks) expect(html).toContain(track.name);
        expect(html).toContain('--grid-template-columns: 3');
        expect(html).toContain('area-w');
        expect(html).not.toContain('area-null');
    });

    it('renders the first speaker, sized avatar, time, and collapsed disclosure', () => {
        const html = render(SessionCard, { props: { session: first } }).body;
        expect(html).toContain('8:30 AM');
        expect(html).toContain('>a</');
        expect(html).toContain('href="/speakers/ada/"');
        expect(html).toContain('Ada profile image');
        expect(html).toContain(
            'src="https://media.example.test/media/ada.jpg?width=100&amp;height=100"',
        );
        expect(html).toContain('width="100"');
        expect(html).toContain('height="100"');
        expect(html).toContain('loading="lazy"');
        expect(html).not.toContain('Ben');
        expect(html).not.toContain('href="/sessions/a/"');
        expect(html).toContain('More');
        expect(html).toContain('aria-expanded="false"');
        expect(html).toContain('aria-controls="session-card-a-panel"');
        expect(html).toContain('id="session-card-a-panel"');
        expect(html).toContain('id="session-card-a-trigger"');
        expect(html).toContain('aria-labelledby="session-card-a-trigger"');
        expect(html).toContain('role="region"');
        expect(html).toContain('<p>Details</p>');
        expect(html).toMatch(/style="[^"]*display:\s*none/);
    });

    it('can disable speaker links without losing the speaker text', () => {
        const html = render(SessionCard, {
            props: { session: first, disableSpeakerLinks: true },
        }).body;
        expect(html).toContain('Ada');
        expect(html).not.toContain('href="/speakers/ada/"');
    });

    it('renders descriptions for sessions without speakers', () => {
        const html = render(SessionCard, { props: { session: lunch } }).body;
        expect(html).toContain('lunch');
        expect(html).toContain('12:00 PM');
        expect(html).toContain('More');
    });

    it('renders the session without disclosure when the description is missing', () => {
        const html = render(SessionCard, {
            props: { session: makeSession('plain', '20:30', [], '') },
        }).body;
        expect(html).toContain('>plain</');
        expect(html).not.toContain('More');
    });

    it('renders an empty grid', () => {
        const html = render(ScheduleGrid, {
            props: { grid: [], tracks: [], sessions: [] },
        }).body;
        expect(html).toContain('aria-label="Schedule tracks"');
        expect(html).toContain('--grid-template-columns: 0');
        expect(html).toContain('--grid-template-areas: none');
    });
});
