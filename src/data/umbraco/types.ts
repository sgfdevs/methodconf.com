import type { components } from '@/data/umbraco/deliveryApiSchema';

// The v18 OpenAPI schema intersects each content model with a base model that has
// `properties: null | Record<string, never>`. This poisons the specific properties
// model via the index signature. ResolveContent overrides `properties` with the
// correct specific type for each content type.
type ContentPropertiesFor<C extends string> = C extends 'conference'
    ? components['schemas']['ConferenceContentPropertiesModel']
    : C extends 'conferences'
      ? components['schemas']['ConferencesContentPropertiesModel']
      : C extends 'home'
        ? components['schemas']['HomeContentPropertiesModel']
        : C extends 'page'
          ? components['schemas']['PageContentPropertiesModel']
          : C extends 'session'
            ? components['schemas']['SessionContentPropertiesModel']
            : C extends 'sessions'
              ? components['schemas']['SessionsContentPropertiesModel']
              : C extends 'speaker'
                ? components['schemas']['SpeakerContentPropertiesModel']
                : C extends 'speakers'
                  ? components['schemas']['SpeakersContentPropertiesModel']
                  : C extends 'sponsors'
                    ? components['schemas']['SponsorsContentPropertiesModel']
                    : C extends 'track'
                      ? components['schemas']['TrackContentPropertiesModel']
                      : Record<string, never>;

type ResolveContent<T> = T extends { contentType: infer C extends string }
    ? Omit<T, 'properties'> & { properties?: ContentPropertiesFor<C> }
    : T;

export type UmbracoContent = ResolveContent<
    components['schemas']['IApiContentResponseModel']
>;
export type RawUmbracoContent =
    components['schemas']['IApiContentResponseModel'];
export type UmbracoContentCollection = Omit<
    components['schemas']['PagedIApiContentResponseModel'],
    'items'
> & { items: UmbracoContent[] };
export type RawUmbracoContentCollection =
    components['schemas']['PagedIApiContentResponseModel'];

export type ContentTypes = UmbracoContent;
export type ContentTypeKeys = ContentTypes['contentType'];

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
        next?: RequestInit['next'];
        cache?: RequestInit['cache'];
    };
};
