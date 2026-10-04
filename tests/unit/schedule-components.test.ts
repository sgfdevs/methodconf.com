import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
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

const bryanSpeaker = {
    id: 'speaker-bryan',
    contentType: 'speaker',
    name: ' Bryan McCann',
    route: {
        path: '/2024/speakers/bryan-mccann/',
        startItem: { id: 'root', path: '/' },
    },
    properties: {
        jobTitle: 'Developer',
        profileImage: [
            {
                id: 'bryan-image',
                name: 'Bryan',
                mediaType: 'Image',
                url: '/media/bryan.jpg',
                width: 100,
                height: 100,
                properties: null,
            },
        ],
    },
} as unknown as Speaker;

const secondSpeaker = {
    id: 'speaker-second',
    contentType: 'speaker',
    name: 'Second Speaker',
    route: {
        path: '/2024/speakers/second-speaker/',
        startItem: { id: 'root', path: '/' },
    },
    properties: {},
} as unknown as Speaker;

const makeSession = ({
    id,
    name,
    slug,
    start,
    speakers = [bryanSpeaker],
    markup = '<p>Session details</p>',
}: {
    id: string;
    name: string;
    slug: string;
    start: string;
    speakers?: Speaker[];
    markup?: string;
}): ParsedSession =>
    ({
        id,
        contentType: 'session',
        name,
        route: {
            path: `/2024/sessions/${slug}/`,
            startItem: { id: 'root', path: '/' },
        },
        properties: {
            start: new Date(start),
            end: new Date('2024-10-12T18:00:00.000Z'),
            speakers,
            description: markup ? { markup, blocks: [] } : null,
        },
    }) as unknown as ParsedSession;

const trackOneSession = makeSession({
    id: 'session-a',
    name: 'How Fast Is My App?',
    slug: 'how-fast-is-my-app-performance-testing-101',
    start: '2024-10-12T13:30:00.000Z',
    speakers: [bryanSpeaker, secondSpeaker],
});
const trackTwoSession = makeSession({
    id: 'session-b',
    name: 'Connect: Why You So Slow?',
    slug: 'connect-why-you-so-slow',
    start: '2024-10-12T14:40:00.000Z',
});
const workshop = makeSession({
    id: 'session-workshop',
    name: 'Yep, You Can Build Hardware',
    slug: 'yep-you-can-build-hardware',
    start: '2024-10-12T13:30:00.000Z',
});
const topLevelLunch = makeSession({
    id: 'session-lunch',
    name: 'Lunch',
    slug: 'lunch',
    start: '2024-10-12T17:00:00.000Z',
    speakers: [],
});

const tracks = [
    {
        id: 'track-one',
        contentType: 'track',
        name: 'Track 1 (Coxhealth)',
        route: {
            path: '/2024/sessions/track-1/',
            startItem: { id: 'root', path: '/' },
        },
        properties: {},
        children: [trackTwoSession, trackOneSession],
    },
    {
        id: 'track-two',
        contentType: 'track',
        name: 'Track 2 (IDEA loft)',
        route: {
            path: '/2024/sessions/track-2/',
            startItem: { id: 'root', path: '/' },
        },
        properties: {},
        children: [],
    },
    {
        id: 'track-workshop',
        contentType: 'track',
        name: 'Workshop',
        route: {
            path: '/2024/sessions/workshop/',
            startItem: { id: 'root', path: '/' },
        },
        properties: {},
        children: [workshop],
    },
] as unknown as TrackWithSessions[];

const grid = [
    ['check-inbreakfast', 'check-inbreakfast', 'check-inbreakfast'],
    [
        'how-fast-is-my-app-performance-testing-101',
        'i-hope-im-not-the-smartest-person-in-the-room',
        'yep-you-can-build-hardware',
    ],
    [
        'connect-why-you-so-slow',
        'energize-your-teams-performance-think-like-an-improv-actor',
        'yep-you-can-build-hardware',
    ],
    ['building-powerful-and-intelligent-applications', 'silent-figures', null],
];

const conference = {
    id: 'conference-id',
    contentType: 'conference',
    name: '2024',
    route: { path: '/2024/', startItem: { id: 'root', path: '/' } },
    properties: {
        date: new Date('2024-10-12T05:00:00.000Z'),
    },
} as unknown as ParsedConference;

const schedule: Schedule = {
    items: [tracks[0], tracks[1], tracks[2], topLevelLunch],
    grid,
};

describe('schedule helpers', () => {
    it('maps public grid IDs, empty cells, and route tails to CSS grid areas', () => {
        expect(createGridAreaId('yep-you-can-build-hardware/')).toBe(
            'area-yep-you-can-build-hardware',
        );
        expect(getEndPath('/2024/sessions/lunch/')).toBe('lunch');
        expect(updateGridIds([[null, '', 'lunch']])).toEqual([
            ['...', '...', 'area-lunch'],
        ]);
    });

    it('slices visible tracks and preserves rectangular duplicate areas', () => {
        const visible = buildVisibleGridState({
            rows: grid,
            tracks,
            startColumnIndex: 1,
            visibleColumns: 2,
        });

        expect(visible.visibleTracks.map((track) => track.name)).toEqual([
            'Track 2 (IDEA loft)',
            'Workshop',
        ]);
        expect(visible.visibleGrid[3]).toEqual([
            'area-energize-your-teams-performance-think-like-an-improv-actor',
            'area-yep-you-can-build-hardware',
        ]);
        expect(visible.visibleGrid[4]).toEqual(['area-silent-figures', '...']);
        expect(gridTemplateAreas(visible.visibleGrid)).toContain(
            'area-track-header area-track-header',
        );
    });

    it('matches live breakpoints and clamps controls', () => {
        expect(visibleColumnCountForWidth(1023, 3)).toBe(1);
        expect(visibleColumnCountForWidth(1024, 3)).toBe(2);
        expect(visibleColumnCountForWidth(1279, 3)).toBe(2);
        expect(visibleColumnCountForWidth(1280, 3)).toBe(3);
        expect(visibleColumnCountForWidth(1280, 2)).toBe(2);
        expect(nextStartColumnIndex(1, 3, 2)).toBe(1);
        expect(previousStartColumnIndex(0)).toBe(0);
        expect(clampStartColumnIndex(2, 3, 2)).toBe(1);
    });

    it('flattens track children and top-level sessions by start time', () => {
        expect(
            flattenAndSortSessions(schedule.items).map((item) => item.id),
        ).toEqual([
            'session-a',
            'session-workshop',
            'session-b',
            'session-lunch',
        ]);
    });
});

describe('schedule SSR components', () => {
    it('renders the schedule section, date, tracks, and SSR three-column grid', () => {
        const html = render(ScheduleBlock, {
            props: { conference, schedule },
        }).body;

        expect(html).toContain('id="schedule"');
        expect(html).toContain('>Schedule</h2>');
        expect(html).toContain('Saturday, October 12th, 2024');
        expect(html).toContain('Track 1 (Coxhealth)');
        expect(html).toContain('Track 2 (IDEA loft)');
        expect(html).toContain('Workshop');
        expect(html).toContain('--grid-template-columns: 3');
        expect(html).toContain('area-yep-you-can-build-hardware');
        expect(html).not.toContain('area-null');
    });

    it('renders speaker cards with the first speaker, avatar crop, time, and no session link', () => {
        const html = render(SessionCard, {
            props: { session: trackOneSession },
        }).body;

        expect(html).toContain('8:30 AM');
        expect(html).toContain('How Fast Is My App?');
        expect(html).toContain('href="/2024/speakers/bryan-mccann/"');
        expect(html).toContain(' Bryan McCann profile image');
        expect(html).toContain('width%3D100%26height%3D100');
        expect(html).toContain('w=128');
        expect(html).toContain('q=75');
        expect(html).toContain(
            'w-[50px] h-[50px] md:w-[70px] md:h-[70px] lg:w-[75px] lg:h-[75px] 2xl:w-[80px] 2xl:h-[80px] rounded-full mr-3',
        );
        expect(html).toContain('More');
        expect(html).toContain('aria-expanded="false"');
        expect(html).not.toContain('Second Speaker');
        expect(html).not.toContain(
            'href="/2024/sessions/how-fast-is-my-app-performance-testing-101/"',
        );
    });

    it('can disable speaker links and still render the speaker text', () => {
        const html = render(SessionCard, {
            props: { session: trackOneSession, disableSpeakerLinks: true },
        }).body;

        expect(html).toContain(' Bryan McCann');
        expect(html).not.toContain('href="/2024/speakers/bryan-mccann/"');
    });

    it('renders no-speaker descriptions with a More button', () => {
        const html = render(SessionCard, {
            props: { session: topLevelLunch },
        }).body;

        expect(html).toContain('Lunch');
        expect(html).toContain('12:00 PM');
        expect(html).toContain('More');
        expect(html).not.toContain('profile image');
    });

    it('uses a valid heading fallback when a description is missing', () => {
        const sessionWithoutDescription = makeSession({
            id: 'session-no-description',
            name: 'No Description',
            slug: 'no-description',
            start: '2024-10-12T20:30:00.000Z',
            markup: '',
        });
        const html = render(SessionCard, {
            props: { session: sessionWithoutDescription },
        }).body;

        expect(html).toContain('<h4');
        expect(html).toContain('No Description');
        expect(html).not.toContain('More');
        expect(html).not.toContain('<h4><div');
    });

    it('renders an empty schedule gracefully', () => {
        const html = render(ScheduleGrid, {
            props: { grid: [], tracks: [], sessions: [] },
        }).body;

        expect(html).toContain('schedule-grid');
        expect(html).toContain('--grid-template-columns: 0');
        expect(html).toContain('--grid-template-areas: none');
    });
});
