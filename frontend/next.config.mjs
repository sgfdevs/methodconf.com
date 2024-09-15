const url = new URL(process.env.NEXT_PUBLIC_UMBRACO_BASE_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    trailingSlash: true,
    images: {
        remotePatterns: [
            {
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
                port: url.port,
            },
        ],
    },
    productionBrowserSourceMaps: true,
};

export default nextConfig;
