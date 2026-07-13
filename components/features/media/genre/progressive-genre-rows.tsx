'use client';

import DataRow from '@/components/features/media/row/data-row';
import type { Genre } from '@/lib/types/tmdb';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const GENRES_PER_BATCH = 3;

interface ProgressiveGenreRowsProps {
	genres: Genre[];
	type: 'movie' | 'tv';
}

export default function ProgressiveGenreRows({ genres, type }: ProgressiveGenreRowsProps) {
	const [visibleGenreCount, setVisibleGenreCount] = useState(
		Math.min(GENRES_PER_BATCH, genres.length)
	);
	const hasMoreGenres = visibleGenreCount < genres.length;
	const { ref: loadMoreRef, inView } = useInView({
		rootMargin: '600px 0px',
		threshold: 0,
		triggerOnce: false,
	});

	useEffect(() => {
		if (inView && hasMoreGenres) {
			setVisibleGenreCount((count) => Math.min(count + GENRES_PER_BATCH, genres.length));
		}
	}, [genres.length, hasMoreGenres, inView]);

	return (
		<>
			{genres.slice(0, visibleGenreCount).map((genre) => (
				<DataRow
					key={genre.id}
					showRank={false}
					type={type}
					endpoint={{ id: genre.id, type }}
					text={genre.name}
					isGenre
				/>
			))}

			{hasMoreGenres && (
				<div ref={loadMoreRef} className="flex justify-center py-2">
					<button
						type="button"
						className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
						onClick={() =>
							setVisibleGenreCount((count) =>
								Math.min(count + GENRES_PER_BATCH, genres.length)
							)
						}
					>
						Show more genres
					</button>
				</div>
			)}
		</>
	);
}
