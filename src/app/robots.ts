import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { isSearchIndexingEnabled } from '@/serverConfig';

export default async function robots(): Promise<MetadataRoute.Robots> {
    await connection();

    return {
        rules: isSearchIndexingEnabled()
            ? { userAgent: '*', allow: '/' }
            : { userAgent: '*', disallow: '/' },
    };
}
