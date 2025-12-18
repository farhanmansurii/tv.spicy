import { fetchGenres } from '@/lib/utils';
import Container from '@/components/shared/containers/container';
import Link from 'next/link';
import { Metadata } from 'next';
import CommonTitle from '@/components/shared/animated/common-title';
import {
	Zap,
	Ghost,
	Heart,
	Rocket,
	Music,
	Search,
	Smile,
	Swords,
	Skull,
	Globe,
	Clapperboard,
	Tv,
	Car,
	Home,
	Mountain,
	BadgeAlert,
	Binary,
	History,
	Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: 'Browse by Genre',
	description: 'Discover movies and TV shows organized by genre',
};

interface Genre {
	id: number;
	name: string;
}

const getGenreIcon = (name: string) => {
	const n = name.toLowerCase();
	if (n.includes('action')) return <Swords className="w-full h-full" />;
	if (n.includes('adventure')) return <Globe className="w-full h-full" />;
	if (n.includes('animation')) return <Palette className="w-full h-full" />;
	if (n.includes('comedy')) return <Smile className="w-full h-full" />;
	if (n.includes('crime')) return <BadgeAlert className="w-full h-full" />;
	if (n.includes('documentary')) return <Search className="w-full h-full" />;
	if (n.includes('drama')) return <Clapperboard className="w-full h-full" />;
	if (n.includes('family')) return <Home className="w-full h-full" />;
	if (n.includes('fantasy')) return <Zap className="w-full h-full" />;
	if (n.includes('history')) return <History className="w-full h-full" />;
	if (n.includes('horror')) return <Ghost className="w-full h-full" />;
	if (n.includes('music')) return <Music className="w-full h-full" />;
	if (n.includes('mystery')) return <Search className="w-full h-full" />;
	if (n.includes('romance')) return <Heart className="w-full h-full" />;
	if (n.includes('science fiction') || n.includes('sci-fi'))
		return <Rocket className="w-full h-full" />;
	if (n.includes('tv movie')) return <Tv className="w-full h-full" />;
	if (n.includes('thriller')) return <Skull className="w-full h-full" />;
	if (n.includes('war')) return <Swords className="w-full h-full" />;
	if (n.includes('western')) return <Mountain className="w-full h-full" />;
	return <Clapperboard className="w-full h-full" />;
};

// 2. Improved "Shadcn-Compatible" Colors
// Using 'group-hover' to only show vibrant color when interacting,
// keeping the default state clean (bg-card).
function getGenreColor(name: string): string {
	const colors = [
		'group-hover:text-orange-500 group-hover:border-orange-500/50 group-hover:shadow-orange-500/20',
		'group-hover:text-purple-500 group-hover:border-purple-500/50 group-hover:shadow-purple-500/20',
		'group-hover:text-blue-500 group-hover:border-blue-500/50 group-hover:shadow-blue-500/20',
		'group-hover:text-emerald-500 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20',
		'group-hover:text-rose-500 group-hover:border-rose-500/50 group-hover:shadow-rose-500/20',
		'group-hover:text-cyan-500 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20',
		'group-hover:text-amber-500 group-hover:border-amber-500/50 group-hover:shadow-amber-500/20',
		'group-hover:text-pink-500 group-hover:border-pink-500/50 group-hover:shadow-pink-500/20',
	];
	const index = name.charCodeAt(0) % colors.length;
	return colors[index];
}

async function GenreList({ type }: { type: 'movie' | 'tv' }) {
	let genres: Genre[] = [];

	try {
		genres = await fetchGenres(type);
	} catch (error) {
		console.error('Failed to fetch genres:', error);
		return null;
	}

	return (
		<section className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex items-center gap-3 px-1">
				<div className="h-8 w-1 bg-primary rounded-full" />
				<h2 className="text-2xl font-semibold text-foreground tracking-tight">
					{type === 'movie' ? 'Movies' : 'TV Shows'}
				</h2>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{genres.map((genre) => {
					const colorClass = getGenreColor(genre.name);
					const Icon = getGenreIcon(genre.name);

					return (
						<Link
							href={`/discover/${genre.id}?type=${type}&id=${genre.id}&title=${genre.name}`}
							key={genre.id}
							className={cn(
								'group relative aspect-[16/9] w-full overflow-hidden rounded-hero md:rounded-hero-md border bg-card text-card-foreground',
								'transition-all duration-300 ease-out',
								'hover:scale-[1.02] hover:shadow-xl',
								'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
								colorClass
							)}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="absolute -right-6 -top-6 h-40 w-40 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 rotate-12 transform text-current">
								{Icon}
							</div>
							<div className="absolute inset-0 p-5 flex flex-col justify-between">
								<div className="self-end">
									<div className="h-8 w-8 text-muted-foreground group-hover:text-current transition-colors duration-300">
										{Icon}
									</div>
								</div>
								<div className="space-y-2">
									<h3 className="text-lg md:text-xl font-bold leading-tight tracking-wide group-hover:translate-x-1 transition-transform duration-300">
										{genre.name}
									</h3>
									<div className="h-1 w-8 rounded-full bg-muted group-hover:bg-current transition-colors duration-300" />
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}

export default async function GenresPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Container className="relative w-full space-y-16 py-12 md:py-20">
				<div className="space-y-2 max-w-2xl">
					<CommonTitle text="Explore Categories" className="tracking-tighter" />
					<p className="text-xl text-muted-foreground font-light">
						Dive into our extensive library curated by mood and style.
					</p>
				</div>

				<div className="space-y-20 pb-20">
					<GenreList type="movie" />
					<GenreList type="tv" />
				</div>
			</Container>
		</div>
	);
}
