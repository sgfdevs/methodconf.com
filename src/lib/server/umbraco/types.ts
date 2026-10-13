import type {
    UmbracoContent,
    UmbracoContentCollection,
} from '#lib/umbraco/types.ts';

export type {
    ContentTypeKeys,
    ContentTypes,
    RawUmbracoContent,
    RawUmbracoContentCollection,
    UmbracoContent,
    UmbracoContentCollection,
} from '#lib/umbraco/types.ts';

export function normalizeUmbracoContent<T>(content: T): UmbracoContent {
    return content as unknown as UmbracoContent;
}

export function normalizeUmbracoContentCollection<T>(
    collection: T,
): UmbracoContentCollection {
    return collection as unknown as UmbracoContentCollection;
}

export type UmbracoClientOptions = {
    requestOptions?: {
        cache?: RequestInit['cache'];
        headers?: RequestInit['headers'];
        signal?: RequestInit['signal'];
    };
};
