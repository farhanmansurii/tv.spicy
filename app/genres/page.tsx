import { fetchGenres } from '@/lib/api';
import Container from '@/components/shared/containers/container';
import {
	Atom,
	Baby,
	Binoculars,
	Broadcast,
	CastleTurret,
	ChatsCircle,
	CirclesThree,
	Compass,
	CowboyHat,
	Crosshair,
	Detective,
	FilmSlate,
	FilmStrip,
	FlagBanner,
	Ghost,
	Heart,
	House,
	MagnifyingGlass,
	MicrophoneStage,
	MusicNote,
	Newspaper,
	PaintBrush,
	Rocket,
	ShieldChevron,
	Smiley,
	Sparkle,
	Sword,
	Television,
} from '@phosphor-icons/react/ssr';
// Type-only, so the CSR barrel is never evaluated at runtime.
import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 604800;

interface Genre {
	id: number;
	name: string;
}

// One icon per TMDB genre id, so no two tiles in a section share a glyph and a
// new genre falls back to the film-strip mark instead of repeating one above it.
const GENRE_ICONS: Record<number, Icon> = {
	28: Sword,
	12: Compass,
	16: PaintBrush,
	35: Smiley,
	80: Detective,
	99: FilmSlate,
	18: MicrophoneStage,
	10751: House,
	14: Sparkle,
	36: CastleTurret,
	27: Ghost,
	10402: MusicNote,
	9648: MagnifyingGlass,
	10749: Heart,
	878: Atom,
	10770: Television,
	53: Crosshair,
	10752: ShieldChevron,
	37: CowboyHat,
	10759: Binoculars,
	10762: Baby,
	10763: Newspaper,
	10764: Broadcast,
	10765: Rocket,
	10766: CirclesThree,
	10767: ChatsCircle,
	10768: FlagBanner,
};

const GenreCard = ({ genre, type, index }: { genre: Genre; type: 'movie' | 'tv'; index: number }) => {
	const Glyph = GENRE_ICONS[genre.id] ?? FilmStrip;

	return (
		<Link
			href={`/discover/${genre.id}?type=${type}&title=${encodeURIComponent(genre.name)}`}
			prefetch={false}
			className={cn(
				'group relative flex min-w-0 min-h-40 flex-col justify-between overflow-hidden rounded-sm border border-border bg-card p-4 transition-[background-color,border-color,transform] duration-(--duration-ui) ease-out md:min-h-48 md:p-6',
				'can-hover:border-border-strong can-hover:bg-secondary active:scale-97 motion-reduce:active:scale-100',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
			)}
		>
			<div className="flex items-center justify-between">
				<span className="font-mono text-caption uppercase tracking-label text-brand tabular-nums">
					{String(index + 1).padStart(2, '0')}
				</span>
				<span
					className="text-muted-foreground transition-colors duration-(--duration-ui) group-can-hover:text-foreground"
					aria-hidden="true"
				>
					<Glyph size={20} weight="regular" />
				</span>
			</div>
			<div className="flex min-w-0 flex-col items-start gap-2">
				<h3 className="min-w-0 max-w-full break-words font-display text-2xl uppercase leading-none text-foreground md:text-3xl">
					{genre.name}
				</h3>
				<span className="font-mono text-micro uppercase tracking-meta-wide text-muted-foreground">
					Explore
				</span>
			</div>
		</Link>
	);
};

function GenreSection({
	title,
	caption,
	genres,
	type,
}: {
	title: string;
	caption: string;
	genres: Genre[] | undefined;
	type: 'movie' | 'tv';
}) {
	return (
		<section className="border-t border-border section-spacing" aria-label={title}>
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
				<div className="flex items-end gap-3">
					<span
						aria-hidden="true"
						className="pb-1.25 font-mono text-caption uppercase leading-none tracking-label text-brand tabular-nums"
					>
						{caption}
					</span>
					<h2 className="font-display text-display-row uppercase leading-none text-foreground">
						{title}
					</h2>
				</div>
				<span className="font-mono text-caption uppercase tracking-meta-wide text-dim tabular-nums">
					{genres?.length ?? 0} genres
				</span>
			</div>
			{genres?.length ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
					{genres.map((genre, index) => (
						<GenreCard key={genre.id} genre={genre} type={type} index={index} />
					))}
				</div>
			) : (
				<p className="border-y border-border bg-secondary/40 px-5 py-10 text-center font-mono text-caption uppercase tracking-label text-muted-foreground">
					Nothing in the archive for this shelf yet.
				</p>
			)}
		</section>
	);
}

export default async function GenresPage() {
	const [movieGenres, tvGenres] = await Promise.all([fetchGenres('movie'), fetchGenres('tv')]);

	return (
		<div className="min-h-screen mt-20 bg-background text-foreground">
			<Container>
				<section className="section-spacing">
					<p className="font-mono text-caption uppercase tracking-label text-muted-foreground">
						Browse the archive
					</p>
					<h1 className="mt-3 max-w-4xl font-display text-display-1 uppercase leading-none text-foreground text-balance">
						Explore Categories
					</h1>
					<p className="mt-4 max-w-prose-secondary text-body leading-relaxed text-muted-foreground">
						Find your next film or series by mood, style, and cinematic era.
					</p>
				</section>

				<GenreSection title="Movie Collections" caption="01" genres={movieGenres} type="movie" />
				<GenreSection title="Series Collections" caption="02" genres={tvGenres} type="tv" />
			</Container>
		</div>
	);
}
