'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { parseUrl } from '@/util';
import { usePathname, useRouter } from 'next/navigation';

export interface InlineScriptProps {
    embedUrl: string;
}

export function OveItEmbed({ embedUrl }: InlineScriptProps) {
    const router = useRouter();
    const pathname = usePathname();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const iframeState = useMemo(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const parsedUrl = parseUrl(embedUrl);

        if (!parsedUrl) {
            return;
        }

        const embedId = parsedUrl.searchParams.get('id') ?? undefined;
        let nextPath: string | undefined;

        // Handles incoming redirects from certain payment providers.
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const parts = hash.split('/');

            if (parts.length >= 2 && parts[0] === embedId && parts[1]) {
                parsedUrl.searchParams.set('next', parts[1]);
                nextPath = parts[1];
            }
        }

        return {
            embedId,
            iframeUrl: parsedUrl,
            nextPath,
        };
    }, [embedUrl]);

    const embedId = iframeState?.embedId;
    const iframeUrl = iframeState?.iframeUrl;

    const sendInfo = useCallback(
        (time: number) => {
            iframeRef.current?.contentWindow?.postMessage(
                {
                    type: 'info',
                    referrer: window.location.href,
                    embedID: embedId,
                    time: time,
                },
                '*',
            );
        },
        [embedId],
    );

    const resizeIframe = useCallback((dimensions: { height: number }) => {
        if (!iframeRef.current) {
            return;
        }

        if (isNaN(dimensions.height)) {
            dimensions.height = 800;
        }
        iframeRef.current.style.height = dimensions.height + 'px';
    }, []);

    useEffect(() => {
        if (iframeState?.nextPath) {
            router.replace(pathname, { scroll: false });
        }
    }, [iframeState?.nextPath, pathname, router]);

    useEffect(() => {
        function onWindowMessage(event: MessageEvent) {
            if (event.source != iframeRef.current?.contentWindow) {
                return;
            }

            switch (event.data.type) {
                case 'resize':
                    resizeIframe(event.data);
                    break;
                case 'info':
                    sendInfo(event.data.time);
                    break;
            }
        }

        function onWindowResize() {
            iframeRef.current?.contentWindow?.postMessage(
                { type: 'resize' },
                '*',
            );
        }

        window.addEventListener('message', onWindowMessage);
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('message', onWindowMessage);
            window.removeEventListener('resize', onWindowResize);
        };
    }, [resizeIframe, sendInfo]);

    return iframeUrl ? (
        <iframe
            className="w-full overflow-hidden"
            ref={iframeRef}
            src={iframeUrl.toString()}
        />
    ) : (
        <>Loading...</>
    );
}
