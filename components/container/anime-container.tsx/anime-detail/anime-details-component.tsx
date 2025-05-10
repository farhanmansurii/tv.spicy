'use client';
import { Anime } from '@/lib/types';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Banner } from '../../tv-details.tsx/Banner';
import { Poster } from '../../tv-details.tsx/Poster';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export default function AnimeDetails({ anime, id }: { anime: Anime; id: any }) {
	return (
		<div className={cn('mx-auto w-full  md:pt-0')}>
			<div className="hidden md:flex">
				<Banner url={anime.cover} />
			</div>
			<div className="mx-auto mb-8 max-w-7xl space-y-8 px-4 md:space-y-12 md:px-0">
				<main className="flex flex-col gap-4 md:flex-row">
					<aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
						<Poster url={anime.image} alt={anime.title.userPreferred} />
					</aside>

					<motion.article
						initial="hidden"
						animate="visible"
						className="flex w-full mt-4 flex-col gap-2 md:w-2/3"
					>
						{anime?.releaseDate && (
							<motion.span custom={0} className="text-xs text-muted-foreground">
								{anime.releaseDate}
							</motion.span>
						)}

						<motion.h1 custom={2} className="text-4xl font-bold">
							{anime.title.userPreferred || anime.title.english}
						</motion.h1>

						<motion.div custom={3} className="flex flex-wrap items-center gap-1.5">
							{anime.genres.map((genre: any, index: any) => (
								<motion.div key={index} variants={fadeUp}>
									<Badge variant="outline" className="whitespace-nowrap">
										{genre}
									</Badge>
								</motion.div>
							))}

							<Separator orientation="vertical" className="h-6" />
							<Badge variant="secondary">
								{anime.rating ? (anime.rating / 10).toFixed(1) : '?'}
							</Badge>
						</motion.div>

						<motion.p className="text-xs leading-5 line-clamp-3 text-muted-foreground md:text-sm md:leading-6">
							{anime.description}
						</motion.p>
					</motion.article>
				</main>
			</div>
		</div>
	);
}
