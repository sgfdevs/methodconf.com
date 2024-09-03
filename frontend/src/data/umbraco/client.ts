import createClient from 'openapi-fetch';
import type { paths } from '@/data/umbraco/schema';
import { CMS_BASE_URL } from '@/config';

export const umbracoClient = createClient<paths>({
    baseUrl: CMS_BASE_URL.toString(),
});
