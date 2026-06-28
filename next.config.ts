// next.config.ts
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
    './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'photos.hotelbeds.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.travelapi.com',
                pathname: '/**',
            }
        ],
    },
};

export default withNextIntl(nextConfig);