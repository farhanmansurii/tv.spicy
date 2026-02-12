import MediaDetails from '@/components/features/media/details/media-details';
import { fetchDetailsTMDB } from '@/lib/api';
import { tmdbImage } from '@/lib/tmdb-image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
export const generateMetadata = async (props: any): Promise<Metadata> => {
	const params = await props.params;

	const { movie } = params;

	try {
		const data = await fetchDetailsTMDB(movie, 'movie');
		if (!data) {
			return {
				title: 'Movie',
				description: 'Movie details',
			};
		}
		const imagePath = data?.backdrop_path || data?.poster_path;
		const imageUrl = imagePath ? tmdbImage(imagePath, 'w1280') : '/icon-512x512.png';
		return {
			title: `${data?.name || data?.title}`,
			description: data.overview || undefined,
			alternates: {
				canonical: `/movie/${movie}`,
			},
			openGraph: {
				title: `${data?.name || data?.title}`,
				description: data.overview || undefined,
				type: 'video.movie',
				images: [
					{
						url: imageUrl,
						alt: data?.name || data?.title || 'Movie',
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
			title: 'Movie',
			description: 'Desc',
		};
	}
};
export default async function TVDetails(props: { params: Promise<{ movie: string }> }) {
	const params = await props.params;
	const { movie } = params;
	const data = await fetchDetailsTMDB(movie, 'movie');
	if (!data) return notFound();
	return <MediaDetails data={data} id={movie} type={'movie'} />;
}
