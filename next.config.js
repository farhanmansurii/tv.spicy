/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		turbopackFileSystemCacheForDev: true,
		scrollRestoration: true,
	},
	reactCompiler: true,
	images: {
		formats: ['image/avif', 'image/webp'],
		minimumCacheTTL: 60 * 60 * 24 * 7,
		remotePatterns: [
			{ protocol: 'https', hostname: 'image.tmdb.org' },
			{ protocol: 'https', hostname: 'img.youtube.com' },
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
};

module.exports = nextConfig;
