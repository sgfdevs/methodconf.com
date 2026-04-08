import type { components } from '@/data/umbraco/deliveryApiSchema';

const CONTENT_TYPE_MAP = {
    PageContentModel: 'page',
    PageContentResponseModel: 'page',
    SessionContentModel: 'session',
    SessionContentResponseModel: 'session',
    SessionsContentModel: 'sessions',
    SessionsContentResponseModel: 'sessions',
    SpeakerContentModel: 'speaker',
    SpeakerContentResponseModel: 'speaker',
    SpeakersContentModel: 'speakers',
    SpeakersContentResponseModel: 'speakers',
    SponsorsContentModel: 'sponsors',
    SponsorsContentResponseModel: 'sponsors',
    TrackContentModel: 'track',
    TrackContentResponseModel: 'track',
} as const;

type ContentTypeMap = {
    [K in keyof typeof CONTENT_TYPE_MAP]: (typeof CONTENT_TYPE_MAP)[K];
};

type NormalizeContentType<T extends string> = T extends keyof ContentTypeMap
    ? ContentTypeMap[T]
    : T;

type NormalizeUmbracoType<T> = T extends (infer U)[]
    ? NormalizeUmbracoType<U>[]
    : T extends readonly (infer U)[]
      ? readonly NormalizeUmbracoType<U>[]
      : T extends object
        ? {
              [K in keyof T]: K extends 'contentType'
                  ? T[K] extends string
                      ? NormalizeContentType<T[K]>
                      : T[K]
                  : NormalizeUmbracoType<T[K]>;
          }
        : T;

export type UmbracoContent = NormalizeUmbracoType<
    components['schemas']['IApiContentResponseModel']
>;
export type RawUmbracoContent =
    components['schemas']['IApiContentResponseModel'];
export type UmbracoContentCollection = NormalizeUmbracoType<
    components['schemas']['PagedIApiContentResponseModel']
>;
export type RawUmbracoContentCollection =
    components['schemas']['PagedIApiContentResponseModel'];

export type ContentTypes = UmbracoContent;
export type ContentTypeKeys = ContentTypes['contentType'];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function normalizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }

    if (!isRecord(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => {
            if (key === 'contentType' && typeof entry === 'string') {
                return [
                    key,
                    CONTENT_TYPE_MAP[entry as keyof ContentTypeMap] ?? entry,
                ];
            }

            return [key, normalizeValue(entry)];
        }),
    );
}

export function normalizeUmbracoContent(
    content: RawUmbracoContent,
): UmbracoContent {
    return normalizeValue(content) as UmbracoContent;
}

export function normalizeUmbracoContentCollection(
    collection: RawUmbracoContentCollection,
): UmbracoContentCollection {
    return normalizeValue(collection) as UmbracoContentCollection;
}

export type UmbracoClientOptions = {
    requestOptions?: {
        next?: RequestInit['next'];
        cache?: RequestInit['cache'];
    };
};
