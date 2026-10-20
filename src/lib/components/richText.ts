import { imageUrl } from '#lib/imageUrl.ts';

const MEDIA_ATTRIBUTE_PATTERN =
    /(\b(?:href|src|srcset)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi;

export function rewriteRichTextMediaUrls(
    markup: string,
    mediaPublicUrl: string,
    ...cmsUrls: string[]
): string {
    const cmsOrigins = [mediaPublicUrl, ...cmsUrls]
        .filter((url): url is string => Boolean(url))
        .map((url) => new URL(url).origin);

    function rewriteUrl(url: string): string {
        try {
            const parsed = new URL(url, mediaPublicUrl);

            if (
                parsed.pathname.startsWith('/media/') &&
                cmsOrigins.includes(parsed.origin)
            ) {
                return imageUrl(url, mediaPublicUrl);
            }
        } catch {
            // Leave malformed and non-URL attributes unchanged.
        }

        return url;
    }

    return markup.replace(
        MEDIA_ATTRIBUTE_PATTERN,
        (
            _match,
            attribute: string,
            doubleQuoted: string | undefined,
            singleQuoted: string | undefined,
        ) => {
            const quote = doubleQuoted !== undefined ? '"' : "'";
            const value = doubleQuoted ?? singleQuoted ?? '';
            const rewritten = /^srcset\b/i.test(attribute)
                ? value.replace(/\S+/g, (token) => {
                      // URLs may contain crop commas, but trailing commas
                      // separate srcset candidates. Descriptors stay unchanged.
                      const separator = /,+$/.exec(token)?.[0] ?? '';
                      const url = token.slice(
                          0,
                          token.length - separator.length,
                      );
                      return rewriteUrl(url) + separator;
                  })
                : rewriteUrl(value);

            return `${attribute}${quote}${rewritten}${quote}`;
        },
    );
}
