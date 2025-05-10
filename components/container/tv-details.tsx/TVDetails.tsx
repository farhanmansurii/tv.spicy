'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { Banner } from './Banner';
import { Poster } from './Poster';
import ContinueWatchingButton from '@/components/common/ContinueWatchingButton';

type showDetailsProps = {
	id: number;
	language: any;
	embed?: boolean;
	show: any;
	type: 'tv' | 'movie';
};

export default function ShowDetails({ id, show, language, embed = false, type }: showDetailsProps) {
	return (
		<div className={cn('mx-auto w-full md:pt-0')}>
			<div className="hidden md:flex">
				<Banner url={tmdbImage(show.backdrop_path)} />
			</div>
			<div className="mx-auto mb-8 max-w-7xl space-y-8 px-4 md:space-y-12 md:px-0">
				<main className="flex items-end flex-col gap-4 md:flex-row">
					<aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
						<Poster url={tmdbImage(show.poster_path)} alt={show.name} />
					</aside>
					<article className="flex w-full mt-4 flex-col gap-2 md:w-2/3">
						{show?.first_air_date && (
							<span className="text-xs text-muted-foreground">
								{format(new Date(show.first_air_date), 'PPP')}
							</span>
						)}
						{show?.release_date && (
							<span className="text-xs text-muted-foreground">
								{format(new Date(show.release_date), 'PPP')}
							</span>
						)}

						<h1 className="text-4xl font-bold">{show.name || show.title}</h1>

						<div className="flex flex-wrap items-center gap-1.5">
							{show.genres.map((genre: any) => (
								<Badge
									key={genre.id}
									variant="outline"
									className="whitespace-nowrap"
								>
									{genre.name}
								</Badge>
							))}

							<Separator orientation="vertical" className="h-6" />

							<Badge>{show.vote_average.toFixed(1)}</Badge>
						</div>

						<p className="text-xs leading-5 line-clamp-3 text-muted-foreground md:text-sm md:leading-6">
							{show.overview}
						</p>

						<div className="flex flex-wrap mb-4 gap-2">
							<ContinueWatchingButton
								isDetailsPage={true}
								id={show.id}
								type={type}
								show={show}
							/>
						</div>
					</article>
				</main>
			</div>
		</div>
	);
}
