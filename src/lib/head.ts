export const DEFAULT_TITLE =
    'Method Conference - October 12th 2024 - Springfield, MO';
export const NOT_FOUND_BROWSER_TITLE = '404: This page could not be found.';
const DEFAULT_OG_IMAGE_PATH =
    '/opengraph-image.jpg?opengraph-image.44rvcdk19e2xk.jpg';
const DEFAULT_ICON_PATH = '/icon.png?icon.232taq741yhvg.png';

export type SharedHeadImage = {
    url?: string;
    type?: string;
    width?: number;
    height?: number;
};

export type SharedHeadMetadata = {
    title?: string;
    description?: string;
    openGraph?: {
        title?: string;
        image?: SharedHeadImage;
    };
};

export type SharedHead = {
    title: string;
    description?: string;
    openGraph: {
        title: string;
        image: Required<SharedHeadImage>;
    };
    twitter: {
        card: 'summary_large_image';
        title: string;
        image: Required<SharedHeadImage>;
    };
    icon: {
        href: string;
        sizes: string;
        type: string;
    };
};

type BuildSharedHeadOptions = {
    siteUrl: string;
    metadata?: SharedHeadMetadata;
};

type ResolveDocumentTitleOptions = {
    sharedTitle: string;
    status: number;
    errorMessage?: string;
    clientMounted: boolean;
};

export function resolveDocumentTitle({
    sharedTitle,
    status,
    errorMessage,
    clientMounted,
}: ResolveDocumentTitleOptions): string {
    if (status === 404) {
        return clientMounted ? NOT_FOUND_BROWSER_TITLE : sharedTitle;
    }

    if (status >= 400) {
        return `${status}: ${errorMessage ?? 'Application error'}`;
    }

    return sharedTitle;
}

function resolveFromSiteUrl(siteUrl: string, pathOrUrl: string): string {
    return new URL(pathOrUrl, siteUrl).toString();
}

export function buildSharedHead({
    siteUrl,
    metadata,
}: BuildSharedHeadOptions): SharedHead {
    const title = metadata?.title ?? DEFAULT_TITLE;
    const image = {
        url: resolveFromSiteUrl(
            siteUrl,
            metadata?.openGraph?.image?.url ?? DEFAULT_OG_IMAGE_PATH,
        ),
        type: metadata?.openGraph?.image?.type ?? 'image/jpeg',
        width: metadata?.openGraph?.image?.width ?? 1200,
        height: metadata?.openGraph?.image?.height ?? 630,
    };
    const openGraphTitle = metadata?.openGraph?.title ?? title;

    return {
        title,
        description: metadata?.description,
        openGraph: {
            title: openGraphTitle,
            image,
        },
        twitter: {
            card: 'summary_large_image',
            title: openGraphTitle,
            image,
        },
        icon: {
            href: DEFAULT_ICON_PATH,
            sizes: '180x180',
            type: 'image/png',
        },
    };
}
