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
        remotePatterns: [
            {
                protocol: url.protocol.replace(':', '') as 'http' | 'https',
                hostname: url.hostname,
                port: url.port,
                pathname: '/**',
            },
        ],
        qualities: [75, 100],
    },
    productionBrowserSourceMaps: true,
};

export default nextConfig;
