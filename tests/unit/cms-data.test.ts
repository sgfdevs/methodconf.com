import { describe, expect, it } from 'vitest';
import { formatDate, parseUtcAsCst } from '#lib/date.ts';
import { parseConference } from '#lib/server/parseConference.ts';
import { parseSession } from '#lib/server/parseSession.ts';
import { treeByRoutePath } from '#lib/server/umbraco/treeByRoutePath.ts';
import type { Conference, Session } from '#lib/types.ts';

describe('CMS dates and route trees', () => {
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

    it('parses conference dates as Chicago-local instants', () => {
        const conference = parseConference({
            id: '2024',
            contentType: 'conference',
            route: { path: '/2024/' },
            properties: { date: '2024-09-20T09:00:00Z' },
        } as unknown as Conference);

        expect(conference.properties.date?.toISOString()).toBe(
            '2024-09-20T14:00:00.000Z',
        );
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

    it('builds the route tree in source order', () => {
        const tree = treeByRoutePath([
            { id: 'sessions', route: { path: '/sessions/' } },
            { id: 'track', route: { path: '/sessions/track/' } },
            { id: 'keynote', route: { path: '/sessions/track/keynote/' } },
            { id: 'sponsors', route: { path: '/sponsors/' } },
        ]);
        expect(tree.map((item) => item.id)).toEqual(['sessions', 'sponsors']);
        expect(tree[0].children.map((item) => item.id)).toEqual(['track']);
        expect(tree[0].children[0].children.map((item) => item.id)).toEqual([
            'keynote',
        ]);
    });
});
