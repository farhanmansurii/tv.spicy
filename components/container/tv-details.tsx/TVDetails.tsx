'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { Banner } from './Banner';
import ContinueWatchingButton from '@/components/common/ContinueWatchingButton';
import CommonTitle from '@/components/animated-common/CommonTitle';

type showDetailsProps = {
	id: number;
	language: any;
	embed?: boolean;
	show: any;
	type: 'tv' | 'movie';
};

export default function ShowDetails({ id, show, language, embed = false, type }: showDetailsProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="mx-auto w-full">
			<div className="block md:block">
				<Banner url={tmdbImage(show.backdrop_path)} />
			</div>

			<div className="  pt-4">
				<main className="flex flex-col md:flex-row gap-4">
					<article className="flex flex-col w-full">
						{show?.first_air_date && (
							<p className="text-xs text-muted-foreground">
								{format(new Date(show.first_air_date), 'PPP')}
							</p>
						)}

						<CommonTitle
							shouldWrap
							text={show.name || show.title}
							className="line-clamp-2 mb-2"
						/>

						<div className="flex flex-wrap pb-3 items-center gap-2">
							{show.genres.map((genre: any) => (
								<Badge key={genre.id} className="text-xs">
									{genre.name}
								</Badge>
							))}

							{show.vote_average && (
								<>
									<Separator orientation="vertical" className="h-4" />
									<Badge className="text-xs">
										{show.vote_average.toFixed(1)}
									</Badge>
								</>
							)}
						</div>

						{show.overview && (
							<div className="text-sm text-muted-foreground pb-4 max-w-2xl">
								<p className={cn(!expanded && 'line-clamp-2')}>{show.overview}</p>
								<button
									onClick={() => setExpanded((prev) => !prev)}
									className="mt-1 text-xs text-white/60 hover:underline underline hover:text-white transition"
								>
									{expanded ? 'Show less' : 'Read more'}
								</button>
								<Separator className="mt-4" />
							</div>
						)}

						<ContinueWatchingButton
							isDetailsPage
							id={show.id}
							type={type}
							show={show}
						/>
					</article>
				</main>
			</div>
		</div>
	);
}
