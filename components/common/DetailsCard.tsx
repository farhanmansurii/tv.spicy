import { Show } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import ContinueWatchingButton from './ContinueWatchingButton';

interface CarousalCardProps {
	show: Show;
	isDetailsPage?: boolean;
	type?: string;
}

const CarousalCardWrapper = ({ show }: CarousalCardProps) => {
	if (!show) return null;

	const title = show.title || show.name || 'Untitled';
	const releaseDate = show.first_air_date || show.release_date || '';
	const formattedDate = releaseDate ? format(new Date(releaseDate), 'PPP') : '';
	const backdrop = show.backdrop_path || show.poster_path || '';

	return (
		<section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden isolate">
			<img
				src={`https://image.tmdb.org/t/p/original/${backdrop}`}
				alt={title}
				className="absolute inset-0 w-full h-full object-cover object-center scale-105 brightness-[0.45] sm:brightness-[0.35]"
			/>

			<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-0" />

			<div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-6 max-w-5xl text-white select-none">
				{formattedDate && (
					<p className="text-xs sm:text-sm text-white/70 mb-1">{formattedDate}</p>
				)}

				<h1 className="text-5xl truncate md:text-7xl pb-4 tracking-tight normal-case text-foreground">
					{title}
				</h1>

				{show.overview && (
					<p className="text-sm sm:text-base text-white/80 max-w-4xl line-clamp-3">
						{show.overview}
					</p>
				)}

				{Array.isArray(show.genres) && show.genres.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{show.genres.map((genre) => (
							<Badge
								key={genre.id}
								variant="outline"
								className="border-white/30 text-white text-xs px-3 py-1"
							>
								{genre.name}
							</Badge>
						))}
					</div>
				)}
				<div className="mt-4">
					<ContinueWatchingButton
						id={show.id}
						show={show}
						type={'tv'}
						isDetailsPage={true}
					/>
				</div>
			</div>
		</section>
	);
};

export default CarousalCardWrapper;
