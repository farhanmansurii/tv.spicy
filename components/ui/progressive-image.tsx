'use client';

import { useState } from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
	path: string;
	size?: 'w780' | 'w1280' | 'original';
	className?: string;
	priority?: boolean;
}

/** Paints a small TMDB rendition at once, then fades the full one in over it. */
export function ProgressiveImage({ path, size = 'w1280', className, priority = false }: ProgressiveImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<>
			<img
				src={tmdbImage(path, 'w300')}
				alt=""
				aria-hidden="true"
				decoding="async"
				className={cn('absolute inset-0 size-full object-cover blur-md', className)}
			/>
			<img
				ref={(node) => {
					if (node?.complete && node.naturalWidth > 0) setIsLoaded(true);
				}}
				src={tmdbImage(path, size)}
				alt=""
				aria-hidden="true"
				decoding="async"
				loading={priority ? 'eager' : 'lazy'}
				fetchPriority={priority ? 'high' : 'auto'}
				onLoad={() => setIsLoaded(true)}
				className={cn(
					'absolute inset-0 size-full object-cover transition-opacity duration-(--duration-image) ease-entrance motion-reduce:transition-none',
					isLoaded ? 'opacity-100' : 'opacity-0',
					className
				)}
			/>
		</>
	);
}
