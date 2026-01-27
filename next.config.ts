import type { NextConfig } from 'next';
import { env } from './src/env';

const nextConfig: NextConfig = {
    // 1. 移除 'standalone'，EdgeOne 的 OpenNext 插件不需要这个
    // output: 'standalone', 

    // 2. 开启实验性压缩，减少部署包体积
    experimental: {
        serverMinification: true,
    },

    webpack: config => {
        config.module.rules.push({
            test: /\.svg$/,
            use: [{ loader: '@svgr/webpack', options: { dimensions: false } }],
        });
        return config;
    },
    rewrites: async () => [
        {
            source: '/docs/:path*',
            destination: env.SPARK_DOCS_URL + '/:path*',
        },
        {
            source: '/thumb/:slug',
            destination: env.SPARK_THUMBNAIL_SERVICE_URL + '/:slug',
        },
        {
            source: '/:slug',
            has: [{ type: 'query', key: 'raw' }],
            destination: env.SPARK_JSON_SERVICE_URL + '/:slug',
        },
    ],
};

export default nextConfig;