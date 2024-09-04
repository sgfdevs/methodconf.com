import { UMBRACO_BASE_URL } from '@/config';

export interface ImageUrlOptions {
    width?: number;
    height?: number;
}

export function imageUrl(url: string, { width, height }: ImageUrlOptions = {}) {
    const parsedUrl = new URL(url, UMBRACO_BASE_URL);

    const urlSearchParams = new URLSearchParams();

    if (width) {
        urlSearchParams.set('width', width.toString());
    }

    if (height) {
        urlSearchParams.set('height', height.toString());
    }

    return `${parsedUrl.toString()}?${urlSearchParams.toString()}`;
}
