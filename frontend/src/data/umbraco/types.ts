import type { components } from '@/data/umbraco/schema';

export type ContentTypes = components['schemas']['IApiContentResponseModel'];
export type ContentTypeKeys = ContentTypes['contentType'];

export type UmbracoClientOptions = {
    requestOptions?: {
        next?: RequestInit['next'];
        cache?: RequestInit['cache'];
    };
};
