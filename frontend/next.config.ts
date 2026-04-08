import type { NextConfig } from 'next';

const umbracoBaseUrl = process.env.NEXT_PUBLIC_UMBRACO_BASE_URL;

if (!umbracoBaseUrl) {
    throw new Error('NEXT_PUBLIC_UMBRACO_BASE_URL is required');
}

const url = new URL(umbracoBaseUrl);

const nextConfig: NextConfig = {
    output: 'standalone',
    trailingSlash: true,
    images: {
        remotePatterns: [url],
    },
    productionBrowserSourceMaps: true,
};

export default nextConfig;
