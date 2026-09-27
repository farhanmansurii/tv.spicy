'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import DataRow from '@/components/features/media/row/data-row';
import { Button } from '@/components/ui/button';
import type { Genre } from '@/lib/types/tmdb';

const GENRES_PER_BATCH = 3;

interface ProgressiveGenreRowsProps {
	genres: Genre[];
	type: 'movie' | 'tv';
	/** Continues the page's row numbering after its own editorial rows. */
	startRowNumber?: number;
	/** Server-fetched first pages by genre id; a missing id keeps the client fetch path. */
	initialDataByGenre?: Record<number, unknown[]>;
}

export default function ProgressiveGenreRows({
	genres,
	type,
	startRowNumber = 1,
	initialDataByGenre,
}: ProgressiveGenreRowsProps) {
	const [visibleGenreCount, setVisibleGenreCount] = useState(
		Math.min(GENRES_PER_BATCH, genres.length)
	);
	const hasMoreGenres = visibleGenreCount < genres.length;
	const remainingGenres = genres.length - visibleGenreCount;
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
			{genres.slice(0, visibleGenreCount).map((genre, index) => (
				<DataRow
					key={genre.id}
					showRank={false}
					type={type}
					endpoint={{ id: genre.id, type }}
					text={genre.name}
					isGenre
					rowNumber={startRowNumber + index}
					initialData={initialDataByGenre?.[genre.id]}
				/>
			))}

			{hasMoreGenres && (
				<div ref={loadMoreRef} className="flex justify-center">
					<Button
						type="button"
						variant="ghost"
						onClick={() =>
							setVisibleGenreCount((count) =>
								Math.min(count + GENRES_PER_BATCH, genres.length)
							)
						}
					>
						Show more genres
						<span className="font-mono text-xs tracking-meta text-dim tabular-nums">
							{remainingGenres} left
						</span>
					</Button>
				</div>
			)}
		</>
	);
}
