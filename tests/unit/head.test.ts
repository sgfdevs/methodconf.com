import { describe, expect, it } from 'vitest';
import {
    DEFAULT_TITLE,
    NOT_FOUND_BROWSER_TITLE,
    resolveDocumentTitle,
} from '../../src/lib/head.ts';

describe('document titles', () => {
    it.each([
        [404, false, DEFAULT_TITLE, undefined, DEFAULT_TITLE],
        [404, true, DEFAULT_TITLE, undefined, NOT_FOUND_BROWSER_TITLE],
        [200, true, 'Session', undefined, 'Session'],
        [500, true, DEFAULT_TITLE, 'Failure', '500: Failure'],
        [500, false, DEFAULT_TITLE, undefined, '500: Application error'],
    ])(
        'resolves status %s with clientMounted=%s',
        (status, clientMounted, sharedTitle, errorMessage, expected) => {
            expect(
                resolveDocumentTitle({
                    status,
                    clientMounted,
                    sharedTitle,
                    errorMessage,
                }),
            ).toBe(expected);
        },
    );
});
