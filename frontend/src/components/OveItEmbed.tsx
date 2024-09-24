'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseUrl } from '@/util';
import { usePathname, useRouter } from 'next/navigation';

export interface InlineScriptProps {
    embedUrl: string;
}

export function OveItEmbed({ embedUrl }: InlineScriptProps) {
    const router = useRouter();
    const pathname = usePathname();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeUrl, setIframeUrl] = useState<URL | undefined>();
    const [embedId, setEmbedId] = useState<string | undefined>();

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

    const updateIframeUrl = useCallback(() => {
        const parsedUrl = parseUrl(embedUrl);

        if (!parsedUrl) {
            return;
        }

        const parsedEmbedId = parsedUrl?.searchParams.get('id') ?? undefined;

        // Handles incoming redirects from certain payment providers
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const parts = hash.split('/');

            if (parts.length >= 2 && parts[0] === parsedEmbedId && parts[1]) {
                parsedUrl.searchParams.set('next', parts[1]);
                router.replace(pathname, { scroll: false });
            }
        }

        setEmbedId(parsedEmbedId);
        setIframeUrl(parsedUrl);
    }, [embedUrl, pathname, router]);

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

        updateIframeUrl();

        return () => {
            window.removeEventListener('message', onWindowMessage);
            window.removeEventListener('resize', onWindowResize);
        };
    }, [resizeIframe, sendInfo, updateIframeUrl]);

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
