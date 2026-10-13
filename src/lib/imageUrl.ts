export interface ImageUrlOptions {
    width?: number;
    height?: number;
}

export function imageUrl(
    url: string,
    cmsPublicUrl: string,
    { width, height }: ImageUrlOptions = {},
): string {
    const parsedUrl = new URL(url, cmsPublicUrl);
    const publicUrl = new URL(cmsPublicUrl);

    // CMS media can arrive with the private API origin. Keep only its path.
    publicUrl.pathname = parsedUrl.pathname;
    publicUrl.search = parsedUrl.search;
    publicUrl.hash = parsedUrl.hash;

    if (width) {
        publicUrl.searchParams.set('width', width.toString());
    }

    if (height) {
        publicUrl.searchParams.set('height', height.toString());
    }

    return publicUrl.toString();
}
