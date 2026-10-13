import type { components } from '#lib/umbraco/deliveryApiSchema.d.ts';

// Umbraco v18's OpenAPI schema intersects each content model with a base model
// that has `properties: null | Record<string, never>`. That index signature
// hides the specific properties model. ResolveContent restores the properties
// type for the content types this site reads.
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
