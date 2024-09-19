'use client';
import { useCallback, useEffect, useRef } from 'react';
import { parseUrl } from '@/util';

export interface InlineScriptProps {
    embedUrl: string;
}

export function OveItEmbed({ embedUrl }: InlineScriptProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const parsedUrl = parseUrl(embedUrl);

    const sendInfo = useCallback(
        (time: number) => {
            iframeRef.current?.contentWindow?.postMessage(
                {
                    type: 'info',
                    referrer: window.location.href,
                    embedID: parsedUrl?.searchParams.get('id'),
                    time: time,
                },
                '*',
            );
        },
        [parsedUrl?.searchParams],
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

    return (
        <iframe
            className="w-full overflow-hidden"
            ref={iframeRef}
            src={embedUrl}
        />
    );
}
