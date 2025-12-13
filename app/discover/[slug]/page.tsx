import Container from '@/components/shared/containers/container';
import LoadMore from '@/components/features/media/load-more';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata(params: any): Promise<Metadata> {
	const searchParams = await params.searchParams;
	const title = searchParams?.title || 'Discover';
	const type = searchParams?.type?.toLowerCase() === 'movie' ? 'Movies' : 'TV Shows';

	return {
		title: `${title} ${type}`,
		description: `Browse ${title} ${type}`,
	};
}

export default async function Page(params: any) {
	const searchParams = await params.searchParams;
	const title = searchParams?.title;
	const type = searchParams?.type?.toLowerCase() === 'movie' ? 'Movies' : 'TV Shows';

	if (!title) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Container className="w-full space-y-8 md:space-y-12 py-6 md:py-8">
				<div className="space-y-2">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
						{title} {type}
					</h1>
					<p className="text-white/60 text-lg">
						Discover the best {title.toLowerCase()} {type.toLowerCase()}
					</p>
				</div>

				<div className="w-full">
					<LoadMore params={params} />
				</div>
			</Container>
		</div>
	);
}
