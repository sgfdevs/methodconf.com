import { defineEnvVars } from '@sveltejs/kit/env';

const optionalString = (value: string | undefined) => value;

const optionalUrl = (value: string | undefined) => {
    if (value === undefined || value === '') {
        return undefined;
    }

    return new URL(value).toString();
};

export const variables = defineEnvVars({
    UMBRACO_BASE_URL: {
        schema: optionalUrl,
        description: 'Private Umbraco Delivery API base URL. Runtime only.',
    },
    CMS_PUBLIC_URL: {
        schema: optionalUrl,
        description:
            'Browser-accessible CMS URL for backoffice redirects. Runtime only.',
    },
    MEDIA_PUBLIC_URL: {
        schema: optionalUrl,
        description:
            'Browser-accessible media origin. Defaults to CMS_PUBLIC_URL at runtime.',
    },
    SITE_URL: {
        schema: optionalUrl,
        description: 'Private canonical site URL. Runtime only.',
    },
    SEARCH_INDEXING_ENABLED: {
        schema: (value) => value === 'true',
        description: 'Private runtime flag for robots policy.',
    },
    NEWSLETTER_ENDPOINT: {
        schema: optionalUrl,
        description: 'Private newsletter endpoint URL. Runtime only.',
    },
    NEWSLETTER_LIST_ID: {
        schema: optionalString,
        description: 'Private newsletter list id. Runtime only.',
    },
});
