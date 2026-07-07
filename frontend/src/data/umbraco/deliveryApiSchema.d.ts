export interface paths {
    "/umbraco/delivery/api/v2/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContent2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItemById2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/item/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItemByPath2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItems2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMedia2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItemById2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/item/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItemByPath2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItems2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ApiBlockItemModel: {
            content: components["schemas"]["IApiElementModel"];
            settings: components["schemas"]["IApiElementModel"];
        };
        ApiBlockListModel: {
            items: components["schemas"]["ApiBlockItemModel"][];
        };
        ApiImageCropperValueModel: {
            url: string;
            focalPoint: components["schemas"]["ImageFocalPointModel"];
            crops: null | components["schemas"]["ImageCropModel"][];
        };
        ApiLinkModel: {
            url?: null | string;
            queryString?: null | string;
            title?: null | string;
            target?: null | string;
            /** Format: uuid */
            destinationId?: null | string;
            destinationType?: null | string;
            route?: components["schemas"]["IApiContentRouteModel"];
            linkType: components["schemas"]["LinkTypeModel"];
            culture?: null | string;
        };
        ConferenceContentModel: {
            /** @constant */
            contentType: "conference";
            properties?: components["schemas"]["ConferenceContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "conference";
        });
        ConferenceContentPropertiesModel: {
            /** Format: date-time */
            date?: null | string;
            registerUrl?: null | string;
            callForSpeakersUrl?: null | string;
            tagline?: null | string;
            location?: null | string;
            surveyUrl?: null | components["schemas"]["ApiLinkModel"][];
            /** Format: date-time */
            surveyAvailableAt?: null | string;
            mobileAppLinks?: null | components["schemas"]["ApiLinkModel"][];
        };
        ConferenceContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["ConferenceContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "conference";
        };
        ConferencesContentModel: {
            /** @constant */
            contentType: "conferences";
            properties?: components["schemas"]["ConferencesContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "conferences";
        });
        ConferencesContentPropertiesModel: Record<string, never>;
        ConferencesContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["ConferencesContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "conferences";
        };
        FileMediaPropertiesModel: {
            umbracoFile?: null | string;
            umbracoExtension?: null | string;
            /** Format: int64 */
            umbracoBytes?: null | number;
        };
        FileMediaWithCropsModel: {
            /** @constant */
            mediaType: "File";
            properties?: components["schemas"]["FileMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "File";
        });
        FileMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["FileMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "File";
        };
        FolderMediaPropertiesModel: Record<string, never>;
        FolderMediaWithCropsModel: {
            /** @constant */
            mediaType: "Folder";
            properties?: components["schemas"]["FolderMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "Folder";
        });
        FolderMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["FolderMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "Folder";
        };
        HomeContentModel: {
            /** @constant */
            contentType: "home";
            properties?: components["schemas"]["HomeContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "home";
        });
        HomeContentPropertiesModel: components["schemas"]["PageContentPropertiesModel"];
        HomeContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["HomeContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "home";
        };
        IApiContentBaseModel: {
            contentType: null | string;
            name?: null | string;
            /** Format: date-time */
            createDate: string;
            /** Format: date-time */
            updateDate: string;
            route: components["schemas"]["IApiContentRouteModel"];
            /** Format: uuid */
            id: string;
            properties: null | Record<string, never>;
        };
        IApiContentModel: components["schemas"]["ConferenceContentModel"] | components["schemas"]["SponsorsContentModel"] | components["schemas"]["SessionContentModel"] | components["schemas"]["SpeakersContentModel"] | components["schemas"]["TrackContentModel"] | components["schemas"]["SpeakerContentModel"] | components["schemas"]["SessionsContentModel"] | components["schemas"]["HomeContentModel"] | components["schemas"]["ConferencesContentModel"] | components["schemas"]["PageContentModel"];
        IApiContentResponseBaseModel: {
            contentType: null | string;
            name?: null | string;
            /** Format: date-time */
            createDate: string;
            /** Format: date-time */
            updateDate: string;
            route: components["schemas"]["IApiContentRouteModel"];
            /** Format: uuid */
            id: string;
            properties: null | Record<string, never>;
            cultures: null | {
                [key: string]: {
                    path: null | string;
                    queryString?: null | string;
                    startItem: {
                        /** Format: uuid */
                        id: string;
                        path: null | string;
                    };
                };
            };
        };
        IApiContentResponseModel: components["schemas"]["ConferenceContentResponseModel"] | components["schemas"]["SponsorsContentResponseModel"] | components["schemas"]["SessionContentResponseModel"] | components["schemas"]["SpeakersContentResponseModel"] | components["schemas"]["TrackContentResponseModel"] | components["schemas"]["SpeakerContentResponseModel"] | components["schemas"]["SessionsContentResponseModel"] | components["schemas"]["HomeContentResponseModel"] | components["schemas"]["ConferencesContentResponseModel"] | components["schemas"]["PageContentResponseModel"];
        IApiContentRouteModel: {
            path: null | string;
            queryString?: null | string;
            startItem: components["schemas"]["IApiContentStartItemModel"];
        };
        IApiContentStartItemModel: {
            /** Format: uuid */
            id: string;
            path: null | string;
        };
        IApiElementBaseModel: {
            contentType: null | string;
            /** Format: uuid */
            id: string;
            properties: null | Record<string, never>;
        };
        IApiElementModel: components["schemas"]["SponsorElementModel"] | components["schemas"]["SponsorTierElementModel"] | components["schemas"]["IntroAndEmailSignupBlockElementModel"] | components["schemas"]["ScheduleBlockElementModel"] | components["schemas"]["TextWithButtonsElementModel"] | components["schemas"]["SponsorsBlockElementModel"] | components["schemas"]["LocationBlockElementModel"] | components["schemas"]["RichTextElementModel"];
        IApiMediaWithCropsBaseModel: {
            focalPoint?: components["schemas"]["ImageFocalPointModel"];
            crops?: null | components["schemas"]["ImageCropModel"][];
            /** Format: uuid */
            id: string;
            name: null | string;
            mediaType: null | string;
            url: null | string;
            extension?: null | string;
            /** Format: int32 */
            width?: null | number;
            /** Format: int32 */
            height?: null | number;
            /** Format: int32 */
            bytes?: null | number;
            properties: null | Record<string, never>;
        };
        IApiMediaWithCropsModel: components["schemas"]["FolderMediaWithCropsModel"] | components["schemas"]["ImageMediaWithCropsModel"] | components["schemas"]["FileMediaWithCropsModel"] | components["schemas"]["UmbracoMediaVideoMediaWithCropsModel"] | components["schemas"]["UmbracoMediaAudioMediaWithCropsModel"] | components["schemas"]["UmbracoMediaArticleMediaWithCropsModel"] | components["schemas"]["UmbracoMediaVectorGraphicsMediaWithCropsModel"];
        IApiMediaWithCropsResponseBaseModel: {
            path: null | string;
            /** Format: date-time */
            createDate: string;
            /** Format: date-time */
            updateDate: string;
            focalPoint?: components["schemas"]["ImageFocalPointModel"];
            crops?: null | components["schemas"]["ImageCropModel"][];
            /** Format: uuid */
            id: string;
            name: null | string;
            mediaType: null | string;
            url: null | string;
            extension?: null | string;
            /** Format: int32 */
            width?: null | number;
            /** Format: int32 */
            height?: null | number;
            /** Format: int32 */
            bytes?: null | number;
            properties: null | Record<string, never>;
        };
        IApiMediaWithCropsResponseModel: components["schemas"]["FolderMediaWithCropsResponseModel"] | components["schemas"]["ImageMediaWithCropsResponseModel"] | components["schemas"]["FileMediaWithCropsResponseModel"] | components["schemas"]["UmbracoMediaVideoMediaWithCropsResponseModel"] | components["schemas"]["UmbracoMediaAudioMediaWithCropsResponseModel"] | components["schemas"]["UmbracoMediaArticleMediaWithCropsResponseModel"] | components["schemas"]["UmbracoMediaVectorGraphicsMediaWithCropsResponseModel"];
        ImageCropCoordinatesModel: {
            /** Format: double */
            x1: number;
            /** Format: double */
            y1: number;
            /** Format: double */
            x2: number;
            /** Format: double */
            y2: number;
        };
        ImageCropModel: {
            alias: null | string;
            /** Format: int32 */
            width: number;
            /** Format: int32 */
            height: number;
            coordinates: components["schemas"]["ImageCropCoordinatesModel"];
        };
        ImageFocalPointModel: {
            /** Format: double */
            left: number;
            /** Format: double */
            top: number;
        };
        ImageMediaPropertiesModel: {
            umbracoFile?: components["schemas"]["ApiImageCropperValueModel"] | null;
            /** Format: int32 */
            umbracoWidth?: null | number;
            /** Format: int32 */
            umbracoHeight?: null | number;
            /** Format: int64 */
            umbracoBytes?: null | number;
            umbracoExtension?: null | string;
        };
        ImageMediaWithCropsModel: {
            /** @constant */
            mediaType: "Image";
            properties?: components["schemas"]["ImageMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "Image";
        });
        ImageMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["ImageMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "Image";
        };
        IntroAndEmailSignupBlockElementModel: {
            /** @constant */
            contentType: "introAndEmailSignupBlock";
            properties?: components["schemas"]["IntroAndEmailSignupBlockElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "introAndEmailSignupBlock";
        });
        IntroAndEmailSignupBlockElementPropertiesModel: {
            text?: components["schemas"]["RichTextModel"] | null;
            emailSignupText?: null | string;
        };
        /** @enum {unknown} */
        LinkTypeModel: "Content" | "Media" | "External";
        LocationBlockElementModel: {
            /** @constant */
            contentType: "locationBlock";
            properties?: components["schemas"]["LocationBlockElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "locationBlock";
        });
        LocationBlockElementPropertiesModel: Record<string, never>;
        PageContentModel: {
            /** @constant */
            contentType: "page";
            properties?: components["schemas"]["PageContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "page";
        });
        PageContentPropertiesModel: {
            blocks?: components["schemas"]["ApiBlockListModel"] | null;
            title?: null | string;
            metaDescription?: null | string;
            openGraphImage?: null | components["schemas"]["IApiMediaWithCropsModel"][];
        };
        PageContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["PageContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "page";
        };
        PagedIApiContentResponseModel: {
            /** Format: int64 */
            total: number;
            items: components["schemas"]["IApiContentResponseModel"][];
        };
        PagedIApiMediaWithCropsResponseModel: {
            /** Format: int64 */
            total: number;
            items: components["schemas"]["IApiMediaWithCropsResponseModel"][];
        };
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
        };
        RichTextElementModel: {
            /** @constant */
            contentType: "richText";
            properties?: components["schemas"]["RichTextElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "richText";
        });
        RichTextElementPropertiesModel: {
            text?: components["schemas"]["RichTextModel"] | null;
        };
        RichTextModel: {
            markup: string;
            blocks: components["schemas"]["ApiBlockItemModel"][];
        };
        ScheduleBlockElementModel: {
            /** @constant */
            contentType: "scheduleBlock";
            properties?: components["schemas"]["ScheduleBlockElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "scheduleBlock";
        });
        ScheduleBlockElementPropertiesModel: Record<string, never>;
        SessionContentModel: {
            /** @constant */
            contentType: "session";
            properties?: components["schemas"]["SessionContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "session";
        });
        SessionContentPropertiesModel: {
            /** Format: date-time */
            start?: null | string;
            /** Format: date-time */
            end?: null | string;
            speakers?: null | components["schemas"]["IApiContentModel"][];
            isEligibleForFeedback?: null | boolean;
            description?: components["schemas"]["RichTextModel"] | null;
        };
        SessionContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["SessionContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "session";
        };
        SessionsContentModel: {
            /** @constant */
            contentType: "sessions";
            properties?: components["schemas"]["SessionsContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sessions";
        });
        SessionsContentPropertiesModel: Record<string, never>;
        SessionsContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["SessionsContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sessions";
        };
        SpeakerContentModel: {
            /** @constant */
            contentType: "speaker";
            properties?: components["schemas"]["SpeakerContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "speaker";
        });
        SpeakerContentPropertiesModel: {
            jobTitle?: null | string;
            profileImage?: null | components["schemas"]["IApiMediaWithCropsModel"][];
            bio?: components["schemas"]["RichTextModel"] | null;
            websiteUrl?: null | string;
            xTwitterUrl?: null | string;
            linkedInUrl?: null | string;
            instagramUrl?: null | string;
        };
        SpeakerContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["SpeakerContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "speaker";
        };
        SpeakersContentModel: {
            /** @constant */
            contentType: "speakers";
            properties?: components["schemas"]["SpeakersContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "speakers";
        });
        SpeakersContentPropertiesModel: Record<string, never>;
        SpeakersContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["SpeakersContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "speakers";
        };
        SponsorElementModel: {
            /** @constant */
            contentType: "sponsor";
            properties?: components["schemas"]["SponsorElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sponsor";
        });
        SponsorElementPropertiesModel: {
            title?: null | string;
            logo?: null | components["schemas"]["IApiMediaWithCropsModel"][];
            darkBackground?: null | boolean;
            mobileAppSponsor?: null | boolean;
            url?: null | string;
        };
        SponsorsBlockElementModel: {
            /** @constant */
            contentType: "sponsorsBlock";
            properties?: components["schemas"]["SponsorsBlockElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sponsorsBlock";
        });
        SponsorsBlockElementPropertiesModel: Record<string, never>;
        SponsorsContentModel: {
            /** @constant */
            contentType: "sponsors";
            properties?: components["schemas"]["SponsorsContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sponsors";
        });
        SponsorsContentPropertiesModel: {
            tiers?: components["schemas"]["ApiBlockListModel"] | null;
            opportunitiesUrl?: null | components["schemas"]["ApiLinkModel"][];
        };
        SponsorsContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["SponsorsContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sponsors";
        };
        SponsorTierElementModel: {
            /** @constant */
            contentType: "sponsorTier";
            properties?: components["schemas"]["SponsorTierElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "sponsorTier";
        });
        SponsorTierElementPropertiesModel: {
            title?: null | string;
            logoSizes?: null | string;
            sponsors?: components["schemas"]["ApiBlockListModel"] | null;
        };
        TextWithButtonsElementModel: {
            /** @constant */
            contentType: "textWithButtons";
            properties?: components["schemas"]["TextWithButtonsElementPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiElementBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "textWithButtons";
        });
        TextWithButtonsElementPropertiesModel: {
            text?: components["schemas"]["RichTextModel"] | null;
            buttons?: null | components["schemas"]["ApiLinkModel"][];
        };
        TrackContentModel: {
            /** @constant */
            contentType: "track";
            properties?: components["schemas"]["TrackContentPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiContentBaseModel"], "contentType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "track";
        });
        TrackContentPropertiesModel: Record<string, never>;
        TrackContentResponseModel: components["schemas"]["IApiContentResponseBaseModel"] & components["schemas"]["TrackContentModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            contentType: "track";
        };
        UmbracoMediaArticleMediaPropertiesModel: {
            umbracoFile?: null | string;
            umbracoExtension?: null | string;
            /** Format: int64 */
            umbracoBytes?: null | number;
        };
        UmbracoMediaArticleMediaWithCropsModel: {
            /** @constant */
            mediaType: "umbracoMediaArticle";
            properties?: components["schemas"]["UmbracoMediaArticleMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaArticle";
        });
        UmbracoMediaArticleMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["UmbracoMediaArticleMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaArticle";
        };
        UmbracoMediaAudioMediaPropertiesModel: {
            umbracoFile?: null | string;
            umbracoExtension?: null | string;
            /** Format: int64 */
            umbracoBytes?: null | number;
        };
        UmbracoMediaAudioMediaWithCropsModel: {
            /** @constant */
            mediaType: "umbracoMediaAudio";
            properties?: components["schemas"]["UmbracoMediaAudioMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaAudio";
        });
        UmbracoMediaAudioMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["UmbracoMediaAudioMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaAudio";
        };
        UmbracoMediaVectorGraphicsMediaPropertiesModel: {
            umbracoFile?: null | string;
            umbracoExtension?: null | string;
            /** Format: int64 */
            umbracoBytes?: null | number;
            /** Format: int32 */
            umbracoWidth?: null | number;
            /** Format: int32 */
            umbracoHeight?: null | number;
        };
        UmbracoMediaVectorGraphicsMediaWithCropsModel: {
            /** @constant */
            mediaType: "umbracoMediaVectorGraphics";
            properties?: components["schemas"]["UmbracoMediaVectorGraphicsMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaVectorGraphics";
        });
        UmbracoMediaVectorGraphicsMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["UmbracoMediaVectorGraphicsMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaVectorGraphics";
        };
        UmbracoMediaVideoMediaPropertiesModel: {
            umbracoFile?: null | string;
            umbracoExtension?: null | string;
            /** Format: int64 */
            umbracoBytes?: null | number;
        };
        UmbracoMediaVideoMediaWithCropsModel: {
            /** @constant */
            mediaType: "umbracoMediaVideo";
            properties?: components["schemas"]["UmbracoMediaVideoMediaPropertiesModel"];
        } & (WithRequired<components["schemas"]["IApiMediaWithCropsBaseModel"], "mediaType"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaVideo";
        });
        UmbracoMediaVideoMediaWithCropsResponseModel: components["schemas"]["IApiMediaWithCropsResponseBaseModel"] & components["schemas"]["UmbracoMediaVideoMediaWithCropsModel"] & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            mediaType: "umbracoMediaVideo";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "GetContent2.0": {
        parameters: {
            query?: {
                /** @description Specifies the content items to fetch. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fetch?: string;
                /** @description Defines how to filter the fetched content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                filter?: string[];
                /** @description Defines how to sort the found content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                sort?: string[];
                /** @description Specifies the number of found content items to skip. Use this to control pagination of the response. */
                skip?: number;
                /** @description Specifies the number of found content items to take. Use this to control pagination of the response. */
                take?: number;
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PagedIApiContentResponseModel"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItemById2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiContentResponseModel"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItemByPath2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path: {
                path: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiContentResponseModel"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItems2.0": {
        parameters: {
            query?: {
                id?: string[];
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiContentResponseModel"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMedia2.0": {
        parameters: {
            query?: {
                /** @description Specifies the media items to fetch. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fetch?: string;
                /** @description Defines how to filter the fetched media items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                filter?: string[];
                /** @description Defines how to sort the found media items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                sort?: string[];
                /** @description Specifies the number of found media items to skip. Use this to control pagination of the response. */
                skip?: number;
                /** @description Specifies the number of found media items to take. Use this to control pagination of the response. */
                take?: number;
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PagedIApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    "GetMediaItemById2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMediaItemByPath2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path: {
                path: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMediaItems2.0": {
        parameters: {
            query?: {
                id?: string[];
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"][];
                };
            };
        };
    };
}
type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
