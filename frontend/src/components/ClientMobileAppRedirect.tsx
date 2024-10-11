'use client';
import { useEffect } from 'react';
import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '@/config';

export function ClientMobileAppRedirect() {
    useEffect(() => {
        const userAgent = window.navigator.userAgent;

        if (/android/i.test(userAgent)) {
            window.location.href = GOOGLE_PLAY_STORE_LINK;
        } else if (
            (/iPad|iPhone|iPod/.test(userAgent) &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                !(window as any).MSStream) ||
            (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document)
        ) {
            window.location.href = APPLE_APP_STORE_LINK;
        } else {
            window.location.href = '/';
        }
    }, []);

    return (
        <p>
            If you are not automatically redirected click <a href="/">here</a>
        </p>
    );
}
