'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '@/config';

export function ClientMobileAppRedirect() {
    const router = useRouter();

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
            router.replace('/');
        }
    }, [router]);

    return (
        <p>
            If you are not automatically redirected click{' '}
            <Link href="/">here</Link>
        </p>
    );
}
