import Container from '@/components/shared/containers/container';
import { fetchRowData } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import MediaRow from '@/components/features/media/row/media-row';
import { Show } from '@/lib/types';
import CommonTitle from '@/components/shared/animated/common-title';

interface PageProps {
	params: Promise<{ slug: string }>;
}

// Map slugs to endpoint and metadata
const categoryMap: Record<
	string,
	{ endpoint: string; title: string; type: 'tv' | 'movie'; description: string }
> = {
	'binge-worthy-series': {
		endpoint: 'trending/tv/week',
		title: 'Binge-Worthy Series',
		type: 'tv',
		description: 'Discover the most trending TV series this week',
	},
	'crowd-favorites-tv': {
		endpoint: 'tv/popular',
		title: 'Crowd Favorites: TV',
		type: 'tv',
		description: 'Popular TV shows loved by audiences worldwide',
	},
	'airing-this-week': {
		endpoint: 'tv/on_the_air',
		title: 'Airing This Week',
		type: 'tv',
		description: 'TV shows currently airing this week',
	},
	'critically-acclaimed-tv': {
		endpoint: 'tv/top_rated',
		title: 'Critically Acclaimed TV',
		type: 'tv',
		description: 'Top-rated TV shows with the highest critical acclaim',
	},
	'blockbuster-hits': {
		endpoint: 'trending/movie/week',
		title: 'Blockbuster Hits',
		type: 'movie',
		description: 'The most trending movies this week',
	},
	'fresh-in-theaters': {
		endpoint: 'movie/now_playing',
		title: 'Fresh in Theaters',
		type: 'movie',
		description: 'Movies currently playing in theaters',
	},
	'cult-classics-fan-favorites': {
		endpoint: 'movie/popular',
		title: 'Cult Classics & Fan Favorites',
		type: 'movie',
		description: 'Popular movies loved by fans around the world',
	},
	'cinema-hall-of-fame': {
		endpoint: 'movie/top_rated',
		title: 'Cinema Hall of Fame',
		type: 'movie',
		description: 'Top-rated movies with the highest critical acclaim',
	},
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const category = categoryMap[slug];

	if (!category) {
		return {
			title: 'Browse',
			description: 'Browse content',
		};
	}

	return {
		title: `${category.title} | Browse`,
		description: category.description,
	};
}

export const revalidate = 3600; // Revalidate every hour

export default async function BrowsePage({ params }: PageProps) {
	const { slug } = await params;
	const category = categoryMap[slug];

	if (!category) {
		return notFound();
	}

	try {
		const shows = await fetchRowData(category.endpoint);

		if (!shows || shows.length === 0) {
			return (
				<div className="min-h-screen bg-background text-foreground">
					<Container className="w-full py-6 md:py-8">
					<div className="text-center py-12">
						<CommonTitle text="No content found" variant="default" as="h1" className="mb-4" />
							<p className="text-muted-foreground">
								We couldn&apos;t find any content for this category.
							</p>
						</div>
					</Container>
				</div>
			);
		}

		return (
			<div className="min-h-screen bg-background text-foreground">
				<Container className="w-full py-6 md:py-8">
					<div className="space-y-6">
						<div className="space-y-2">
							<CommonTitle
								text={category.title}
								variant="large"
								as="h1"
							/>
							<p className="text-muted-foreground text-lg">{category.description}</p>
						</div>

						<MediaRow
							shows={shows as Show[]}
							text=""
							type={category.type}
							isVertical={true}
							showRank={false}
						/>
					</div>
				</Container>
			</div>
		);
	} catch (error) {
		console.error('Error loading browse page:', error);
		return (
			<div className="min-h-screen bg-background text-foreground">
				<Container className="w-full py-6 md:py-8">
					<div className="text-center py-12">
						<CommonTitle text="Something went wrong" variant="default" as="h1" className="mb-4" />
						<p className="text-muted-foreground">Please try refreshing the page.</p>
					</div>
				</Container>
			</div>
		);
	}
}
