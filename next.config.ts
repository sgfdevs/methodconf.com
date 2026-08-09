import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    trailingSlash: true,
    images: {
        localPatterns: [{ pathname: '/cms-media/**' }],
        qualities: [75, 100],
    },
    productionBrowserSourceMaps: true,
};

export default nextConfig;
