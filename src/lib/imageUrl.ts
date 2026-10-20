export interface ImageUrlOptions {
    width?: number;
    height?: number;
}

export function imageUrl(
    url: string,
    cmsPublicUrl: string,
    { width, height }: ImageUrlOptions = {},
): string {
    // The CMS owns absolute media URLs. Resolve only relative URLs locally.
    const publicUrl = new URL(url, cmsPublicUrl);

    if (width) {
        publicUrl.searchParams.set('width', width.toString());
    }

    if (height) {
        publicUrl.searchParams.set('height', height.toString());
    }

    return publicUrl.toString();
}
