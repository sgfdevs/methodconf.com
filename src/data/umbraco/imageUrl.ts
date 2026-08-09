export interface ImageUrlOptions {
    width?: number;
    height?: number;
}

export function imageUrl(url: string, { width, height }: ImageUrlOptions = {}) {
    const parsedUrl = new URL(url, 'http://cms.local');
    const urlSearchParams = parsedUrl.searchParams;

    if (width) {
        urlSearchParams.set('width', width.toString());
    }

    if (height) {
        urlSearchParams.set('height', height.toString());
    }

    const search = urlSearchParams.size > 0 ? `?${urlSearchParams}` : '';

    return `/cms-media${parsedUrl.pathname}${search}`;
}
