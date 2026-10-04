import { describe, expect, it } from 'vitest';
import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '#lib/config.ts';
import { getMobileAppStoreRedirect } from '#lib/mobileApp.ts';

describe('mobile app store redirect detection', () => {
    it('redirects Android user agents to Google Play', () => {
        expect(getMobileAppStoreRedirect('Mozilla/5.0 Android')).toBe(
            GOOGLE_PLAY_STORE_LINK,
        );
    });

    it('redirects iOS user agents to the Apple App Store', () => {
        expect(getMobileAppStoreRedirect('Mozilla/5.0 iPhone')).toBe(
            APPLE_APP_STORE_LINK,
        );
    });

    it('redirects touch Macs to the Apple App Store', () => {
        expect(getMobileAppStoreRedirect('Mozilla/5.0 Macintosh', true)).toBe(
            APPLE_APP_STORE_LINK,
        );
    });

    it('does not treat narrow desktop state as a mobile user agent', () => {
        expect(
            getMobileAppStoreRedirect('Mozilla/5.0 Macintosh'),
        ).toBeUndefined();
    });
});
