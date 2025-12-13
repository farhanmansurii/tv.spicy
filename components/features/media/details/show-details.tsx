'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { tmdbImage } from '@/lib/tmdb-image';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { differenceInDays, differenceInHours } from 'date-fns';
import { MonitorPlay } from 'lucide-react';

type showDetailsProps = {
	id: number;
	show: any;
	type: 'tv' | 'movie';
};

export default function ShowDetails({ id, show, type }: showDetailsProps) {
	const [timeLeft, setTimeLeft] = useState<string>('');

	const nextEpisode = show.next_episode_to_air;
	const releaseYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : '';
	const runtime = show.runtime ? `${Math.floor(show.runtime / 60)}h ${show.runtime % 60}m` : null;
	const rating =
		show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || 'TV-MA';

	// Get logo - prefer English, then any logo, then null
	const logo =
		show.images?.logos?.find((img: any) => img.iso_639_1 === 'en')?.file_path ||
		show.images?.logos?.find((img: any) => img.iso_639_1 === null)?.file_path ||
		show.images?.logos?.[0]?.file_path;

	useEffect(() => {
		if (nextEpisode?.air_date) {
			const now = new Date();
			const airDate = new Date(nextEpisode.air_date);
			const days = differenceInDays(airDate, now);
			const hours = differenceInHours(airDate, now) % 24;

			if (days > 0) setTimeLeft(`${days}d ${hours}h`);
			else if (hours > 0) setTimeLeft(`${hours}h`);
			else setTimeLeft('Today');
		}
	}, [nextEpisode]);

	// Use poster for mobile, backdrop for desktop
	const posterPath = show.poster_path || show.backdrop_path;
	const backdropPath = show.backdrop_path || show.poster_path;

	return (
		<div className="w-full animate-in fade-in duration-700">
			<div className="relative w-full aspect-[2/3] md:aspect-[16/8] overflow-hidden md:rounded-[32px] bg-black shadow-2xl ring-1 ring-white/10 group">
				<div className="absolute inset-0 z-0">
					{/* Mobile: Poster Image */}
					<img
						src={tmdbImage(posterPath, 'w500')}
						alt={show.name || show.title}
						className="w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:hidden"
					/>
					{/* Desktop: Backdrop Image */}
					<img
						src={tmdbImage(backdropPath, 'original')}
						alt={show.name || show.title}
						className="hidden w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:block"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent md:via-transparent" />
					<div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
				</div>
				<div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 lg:px-12 lg:py-10">
					<div className="max-w-3xl flex flex-col items-start gap-6">
						{logo ? (
							<div className="w-full max-w-[280px] md:max-w-[400px] lg:max-w-[500px] mb-2">
								<img
									src={tmdbImage(logo, 'w500')}
									alt={show.name}
									className="w-full h-auto object-contain drop-shadow-2xl"
									style={{
										maskImage:
											'linear-gradient(to bottom, black 90%, transparent 100%)',
									}}
								/>
							</div>
						) : (
							<h1 className="text-5xl  font-bold tracking-tighter text-white drop-shadow-2xl">
								{show.name || show.title}
							</h1>
						)}

						<div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/90">
							{show.vote_average > 0 && (
								<Badge
									variant="secondary"
									className="bg-white/20 hover:bg-white/20 backdrop-blur-md text-white border-0 px-2 py-0.5 rounded text-xs font-semibold"
								>
									{Math.round(show.vote_average * 10)}% Match
								</Badge>
							)}

							<span>{releaseYear}</span>

							{show.number_of_seasons && (
								<>
									<span className="text-white/40">•</span>
									<span>{show.number_of_seasons} Seasons</span>
								</>
							)}

							{runtime && (
								<>
									<span className="text-white/40">•</span>
									<span>{runtime}</span>
								</>
							)}

							<span className="text-white/40">•</span>
							<span className="border border-white/30 px-1 rounded text-[10px] uppercase font-bold tracking-wider">
								{rating}
							</span>
							<span className="border border-white/30 px-1 rounded text-[10px] uppercase font-bold tracking-wider">
								4K
							</span>
						</div>

						{nextEpisode && (
							<div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-lg p-3 pr-5 w-full md:w-auto">
								<div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
									<MonitorPlay className="h-5 w-5 text-white/80" />
								</div>
								<div className="flex flex-col gap-0.5">
									<span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
										Up Next • {timeLeft}
									</span>
									<span className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-xs">
										S{nextEpisode.season_number} E{nextEpisode.episode_number}:{' '}
										{nextEpisode.name}
									</span>
								</div>
							</div>
						)}

						{show.overview && (
							<p className="text-white/80 text-base md:text-lg leading-relaxed font-medium line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
								{show.overview}
							</p>
						)}

						{/* Action Buttons */}
						<ContinueWatchingButton
							id={id}
							show={show}
							type={type}
							isDetailsPage={true}
						/>

						<div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
							{show.genres?.slice(0, 4).map((genre: any) => (
								<span
									key={genre.id}
									className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-default"
								>
									{genre.name}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
