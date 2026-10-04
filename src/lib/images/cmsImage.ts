const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;
const IMAGE_SIZES = [32, 48, 64, 96, 128, 256, 384] as const;

export const NEXT_IMAGE_SIZES = [...IMAGE_SIZES, ...DEVICE_SIZES].sort(
    (a, b) => a - b,
);

export interface CmsImageAttributesOptions {
    src: string;
    width: number;
    height: number;
    alt: string;
    quality?: 75 | 100;
    sizes?: string;
    loading?: 'eager' | 'lazy';
    decoding?: 'async' | 'auto' | 'sync';
    fetchpriority?: 'high' | 'low' | 'auto';
    class?: string;
    style?: string;
}

export interface CmsImageAttributes {
    src: string;
    srcset: string;
    width: number;
    height: number;
    alt: string;
    loading?: 'eager' | 'lazy';
    decoding?: 'async' | 'auto' | 'sync';
    fetchpriority?: 'high' | 'low' | 'auto';
    class?: string;
    style?: string;
    sizes?: string;
}

export function nextFixedWidths(width: number): number[] {
    return [
        ...new Set(
            [width, width * 2].map(
                (target) =>
                    NEXT_IMAGE_SIZES.find((candidate) => candidate >= target) ??
                    NEXT_IMAGE_SIZES[NEXT_IMAGE_SIZES.length - 1],
            ),
        ),
    ];
}

export function buildOptimizerUrl(
    src: string,
    width: number,
    quality = 75,
): string {
    const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: quality.toString(),
    });

    return `/_image?${params}`;
}

export function buildCmsImageAttributes({
    src,
    width,
    height,
    alt,
    quality = 75,
    sizes,
    loading,
    decoding,
    fetchpriority,
    class: className,
    style,
}: CmsImageAttributesOptions): CmsImageAttributes {
    const widths = nextFixedWidths(width);
    const descriptors = sizes
        ? widths.map(
              (candidate) =>
                  `${buildOptimizerUrl(src, candidate, quality)} ${candidate}w`,
          )
        : widths.map(
              (candidate, index) =>
                  `${buildOptimizerUrl(src, candidate, quality)} ${index + 1}x`,
          );

    return {
        src: buildOptimizerUrl(src, widths[widths.length - 1], quality),
        srcset: descriptors.join(', '),
        width,
        height,
        alt,
        loading,
        decoding,
        fetchpriority,
        class: className,
        style,
        sizes,
    };
}
