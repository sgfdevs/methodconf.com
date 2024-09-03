import { Configuration, ContentApi, MediaApi } from '@/data/apiClient';
import { CMS_BASE_URL } from '@/config';

const config = new Configuration({
    basePath: CMS_BASE_URL.toString().replace(/\/$/, ''),
});

export const mediaClient = new MediaApi(config);

export const contentClient = new ContentApi(config);
