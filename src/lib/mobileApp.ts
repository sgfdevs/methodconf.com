import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '#lib/config.ts';

export function getMobileAppStoreRedirect(
    userAgent: string,
    isTouchMac = false,
    hasMicrosoftStream = false,
): string | undefined {
    if (/android/i.test(userAgent)) {
        return GOOGLE_PLAY_STORE_LINK;
    }

    if (
        (/iPad|iPhone|iPod/.test(userAgent) && !hasMicrosoftStream) ||
        (/Macintosh/.test(userAgent) && isTouchMac)
    ) {
        return APPLE_APP_STORE_LINK;
    }

    return undefined;
}
