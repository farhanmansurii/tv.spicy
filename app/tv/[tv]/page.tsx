import MediaDetails from '@/components/features/media/details/media-details';

import { fetchDetailsTMDB } from '@/lib/api';
import { tmdbImage } from '@/lib/tmdb-image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
export const generateMetadata = async (props: any): Promise<Metadata> => {
	const params = await props.params;

	const { tv } = params;

	try {
		const data = await fetchDetailsTMDB(tv, 'tv');
		if (!data) {
			return {
				title: 'TV Show',
				description: 'TV show details',
			};
		}
		const imagePath = data?.backdrop_path || data?.poster_path;
		const imageUrl = imagePath ? tmdbImage(imagePath, 'w1280') : '/icon-512x512.png';
		return {
			title: `${data?.name || data?.title}`,
			description: data.overview || undefined,
			alternates: {
				canonical: `/tv/${tv}`,
			},
			openGraph: {
				title: `${data?.name || data?.title}`,
				description: data.overview || undefined,
				type: 'video.tv_show',
				images: [
					{
						url: imageUrl,
						alt: data?.name || data?.title || 'TV Show',
					},
				],
			},
			twitter: {
				card: 'summary_large_image',
				title: `${data?.name || data?.title}`,
				description: data.overview || undefined,
				images: [imageUrl],
			},
		};
	} catch (e) {
		return {
			title: 'TV Show',
			description: 'Desc',
		};
	}
};
export default async function TVDetails(props: { params: Promise<{ tv: string }> }) {
	const params = await props.params;
	const tmdb = await fetchDetailsTMDB(params.tv, 'tv');
	if (!tmdb) return notFound();
	return <MediaDetails data={tmdb} id={params.tv} type={'tv'} />;
}
