import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spicy-tv.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	return [
		{ url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
		{ url: `${SITE_URL}/movie`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
		{ url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
		{ url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
		{ url: `${SITE_URL}/library`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
		{ url: `${SITE_URL}/genres`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
	];
}
