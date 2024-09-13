import { components } from '@/data/umbraco/schema';

export type ContentTypes = components['schemas']['IApiContentResponseModel'];
export type ContentTypeKeys = ContentTypes['contentType'];
