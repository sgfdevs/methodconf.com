import type { components } from '@/data/umbraco/deliveryApiSchema';

export type UmbracoContent = components['schemas']['IApiContentResponseModel'];
export type UmbracoContentCollection =
    components['schemas']['PagedIApiContentResponseModel'];

export type ContentTypes = UmbracoContent;
export type ContentTypeKeys = ContentTypes['contentType'];

export type UmbracoClientOptions = {
    requestOptions?: {
        next?: RequestInit['next'];
        cache?: RequestInit['cache'];
    };
};
