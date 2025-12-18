import { fetchGenres } from '@/lib/utils';
import Link from 'next/link';
import CommonTitle from '@/components/shared/animated/common-title';

interface Genre {
	id: number;
	name: string;
}

async function GenreList({ type }: { type: 'movie' | 'tv' }) {
	let genres: Genre[] = [];

	try {
		genres = await fetchGenres(type);
	} catch (error) {
		console.error('Failed to fetch genres:', error);
		return <div>Error loading genres. Please try again later.</div>;
	}

	return (
		<div className="">
			<CommonTitle
				text={`${type.charAt(0).toUpperCase() + type.slice(1)} Genres`}
				variant="section"
				as="h2"
				className="mb-4"
			/>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{genres.map((genre) => (
					<Link
						href={`/discover/${genre.id}?type=${type}&id=${genre.id}&title=${genre.name}`}
						key={genre.id}
						className="p-3 hover:bg-primary/20 hover:scale-95 duration-300 border rounded-lg "
					>
						<span className="text-lg whitespace-pre-wrap font-semibold">
							{genre.name}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}

export default function GenrePage() {
	return (
		<div className="py-10 flex-col flex gap-10">
			<GenreList type="movie" />
			<GenreList type="tv" />
		</div>
	);
}
