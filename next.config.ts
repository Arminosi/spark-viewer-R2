import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // 1. 强制静态导出，这样就不会产生任何“云函数”，部署会秒过
    output: 'export', 
    
    // 2. 图像优化在静态导出时需要关闭或使用自定义 loader
    images: {
        unoptimized: true,
    },

    webpack: config => {
        config.module.rules.push({
            test: /\.svg$/,
            use: [{ loader: '@svgr/webpack', options: { dimensions: false } }],
        });
        return config;
    },
    // 注意：这里删除了 rewrites，我们去 EdgeOne 后台配
};

export default nextConfig;