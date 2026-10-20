import { rewriteRichTextMediaUrls } from '#lib/components/richText.ts';
import { imageUrl } from '#lib/imageUrl.ts';
import { getCmsPublicUrl, getUmbracoBaseUrl } from '#lib/server/config.ts';

// Rewrite media after fetching, not in the shared JSON cache. Private media
// origins stay out of serialized URL fields and nested rich text.
export function rewriteContentMedia<T>(content: T): T {
    const publicUrl = getCmsPublicUrl().toString();
    const internalUrl = getUmbracoBaseUrl().toString();
    const cmsOrigins = [new URL(publicUrl).origin, new URL(internalUrl).origin];

    function rewriteMediaUrl(url: string): string {
        try {
            const parsed = new URL(url, publicUrl);
            if (
                parsed.pathname.startsWith('/media/') &&
                cmsOrigins.includes(parsed.origin)
            ) {
                return imageUrl(
                    parsed.pathname + parsed.search + parsed.hash,
                    publicUrl,
                );
            }
        } catch {
            // Keep malformed CMS fields unchanged.
        }
        return url;
    }

    function rewrite(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(rewrite);
        }

        if (value !== null && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, child]) => [
                    key,
                    key === 'markup' && typeof child === 'string'
                        ? rewriteRichTextMediaUrls(
                              child,
                              publicUrl,
                              internalUrl,
                          )
                        : key === 'url' && typeof child === 'string'
                          ? rewriteMediaUrl(child)
                          : rewrite(child),
                ]),
            );
        }

        return value;
    }

    return rewrite(content) as T;
}
