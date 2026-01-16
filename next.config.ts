import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// experimental: {
	// 	forceSwcTransforms: true,
	// },
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	images: {
		domains: ['wallpapers.com', 'img.freepik.com', 'res.cloudinary.com'],
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	output: 'standalone',
	/* webpackDevMiddleware: (config: any) => {
		config.watchOptions = {
			poll: 1000,
			aggregateTimeout: 300,
		};
		return config;
	}, */
	allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
	watchOptions: {
		pollIntervalMs: 1000,
	},
};

export default nextConfig;
