import { describe, expect, it } from 'vitest';
import { formatDate, parseUtcAsCst } from '#lib/date.ts';
import { parseConference } from '#lib/server/parseConference.ts';
import { parseSession } from '#lib/server/parseSession.ts';
import { treeByRoutePath } from '#lib/server/umbraco/treeByRoutePath.ts';
import { normalizeUmbracoContent } from '#lib/server/umbraco/types.ts';
import type { Conference, Session } from '#lib/types.ts';

describe('CMS dates and normalization helpers', () => {
    it('interprets Umbraco date parts in America/Chicago and returns plain Date instances', () => {
        const summer = parseUtcAsCst('2024-09-20T09:30:15.123Z');
        const winter = parseUtcAsCst('2024-01-15T09:30:00+00:00');

        expect(summer).toBeInstanceOf(Date);
        expect(Object.getPrototypeOf(summer)).toBe(Date.prototype);
        expect(summer.toISOString()).toBe('2024-09-20T14:30:15.123Z');
        expect(formatDate(summer, 'yyyy-MM-dd HH:mm xxx')).toBe(
            '2024-09-20 09:30 -05:00',
        );
        expect(winter.toISOString()).toBe('2024-01-15T15:30:00.000Z');
        expect(formatDate(winter, 'yyyy-MM-dd HH:mm xxx')).toBe(
            '2024-01-15 09:30 -06:00',
        );
    });

    it('keeps conference sorting based on parsed Chicago-local instants', () => {
        const conferences = [
            makeConference('2023', '2023-09-20T09:00:00Z'),
            makeConference('2024', '2024-09-20T09:00:00Z'),
            makeConference('no-date'),
        ].map(parseConference);

        const latest = conferences
            .filter((conference) => conference.properties.date)
            .sort(
                (a, b) =>
                    b.properties.date!.getTime() - a.properties.date!.getTime(),
            )[0];

        expect(latest.route.path).toBe('/2024/');
        expect(
            formatDate(latest.properties.date!, 'yyyy-MM-dd HH:mm xxx'),
        ).toBe('2024-09-20 09:00 -05:00');
    });

    it('parses session dates without changing other properties', () => {
        const session = parseSession({
            id: 'session-1',
            contentType: 'session',
            route: { path: '/2024/sessions/keynote/' },
            properties: {
                title: 'Opening keynote',
                start: '2024-09-20T10:00:00Z',
                end: '2024-09-20T10:45:00Z',
            },
        } as unknown as Session);

        expect(session.id).toBe('session-1');
        expect(formatDate(session.properties.start!, 'HH:mm')).toBe('10:00');
        expect(formatDate(session.properties.end!, 'HH:mm')).toBe('10:45');
    });

    it('normalizes Umbraco content types and builds the route tree in source order', () => {
        const scheduleRoot = normalizeUmbracoContent({
            id: 'sessions-root',
            contentType: 'sessions',
            route: { path: '/2024/sessions/' },
            properties: {},
        });
        const track = normalizeUmbracoContent({
            id: 'track-1',
            contentType: 'track',
            route: { path: '/2024/sessions/track-1/' },
            properties: { title: 'Track 1' },
        });
        const session = normalizeUmbracoContent({
            id: 'session-1',
            contentType: 'session',
            route: { path: '/2024/sessions/track-1/keynote/' },
            properties: { title: 'Opening keynote' },
        });
        const laterRoot = normalizeUmbracoContent({
            id: 'sponsors-root',
            contentType: 'sponsors',
            route: { path: '/2024/sponsors/' },
            properties: {},
        });

        const tree = treeByRoutePath([scheduleRoot, track, session, laterRoot]);

        expect(tree.map((item) => item.id)).toEqual([
            'sessions-root',
            'sponsors-root',
        ]);
        expect(tree[0].children.map((item) => item.id)).toEqual(['track-1']);
        expect(tree[0].children[0].children.map((item) => item.id)).toEqual([
            'session-1',
        ]);
    });
});

function makeConference(slug: string, date?: string): Conference {
    return {
        id: slug,
        contentType: 'conference',
        route: { path: `/${slug}/` },
        properties: { date },
    } as unknown as Conference;
}
