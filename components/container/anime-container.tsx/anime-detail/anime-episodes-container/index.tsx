/* eslint-disable @next/next/no-img-element */
'use client';

import { TextGlitch } from '@/components/animated-common/TextFlip';
import SeasonsTabLoader from '@/components/container/SeasonsTabLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { fetchData } from '@/lib/anime-helpers';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Dot, GalleryVerticalEnd, Grid, ImageIcon, List } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import AnimePlayer from './anime-player';
import { AnimeEpisode } from '@/lib/types';

const EPISODES_PER_PAGE = 25;

const AnimeEpisodeCard = ({
	episode,
	toggleAnimeEpisode,
}: {
	episode: any;
	toggleAnimeEpisode: (id: string) => any;
}) => (
	<CarouselItem
		onClick={() => toggleAnimeEpisode(episode.id)}
		className={cn(
			`group basis-[48.75%] w-full md:basis-[32.75%] group duration-100 hover:scale-95`
		)}
	>
		<div className="relative">
			<div
				style={{ aspectRatio: 16 / 9 }}
				className="relative h-full flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/20 shadow"
			>
				{episode.image ? (
					<div>
						<img
							className="object-cover inset-0 object-fit"
							src={episode.image}
							alt="title"
						/>
						<svg
							fill="currentColor"
							viewBox="0 0 16 16"
							height="2em"
							width="2em"
							className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
						>
							<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
						</svg>
						<Badge className="absolute top-0 m-1 right-0">EP {episode.number}</Badge>
					</div>
				) : (
					<div className="flex items-center justify-center w-full h-full bg-background">
						<ImageIcon className="text-muted" />
					</div>
				)}
			</div>
		</div>
		<div className="w-full items-center space-x-2 flex flex-row">
			<div className="my-2">
				<div className="flex items-start text-sm md:text-base justify-between gap-1">
					<TextGlitch>{episode.title || episode.name}</TextGlitch>
				</div>
				<div className="text-xs text-muted-foreground flex gap-1 capitalize">
					{format(new Date(episode.createdAt), 'PPP')}
				</div>
			</div>
		</div>
	</CarouselItem>
);

export default function AnimeEpisodesContainer({ id }: { id: any }) {
	const {
		data: episodes,
		isLoading: episodesLoading,
		isError: episodesError,
	} = useQuery({
		queryKey: ['episodesData', id],
		queryFn: async () => await fetchData(`episodes/${id}?provider=gogoanime`),
	});
	const [view, setView] = useState<'grid' | 'list' | 'carousel'>('carousel');
	const [currentPage, setCurrentPage] = useState(1);
	const [activeEpisodeId, setactiveEpisodeId] = useState(episodes?.[0]?.id);
	const totalPages = Math.ceil(episodes?.length / EPISODES_PER_PAGE);

	const startIdx = (currentPage - 1) * EPISODES_PER_PAGE;
	const endIdx = startIdx + EPISODES_PER_PAGE;

	const visibleEpisodes = episodes?.slice(startIdx, endIdx);

	const handlePageChange = (page: any) => {
		setCurrentPage(page);
	};

	const getRangeText = (pageNumber: number): string => {
		const startIdx = (pageNumber - 1) * EPISODES_PER_PAGE + 1;
		const endIdx = startIdx + EPISODES_PER_PAGE - 1;
		return `${startIdx} - ${Math.min(endIdx, episodes.length)}`;
	};

	const searchParams = useSearchParams();

	const toggleAnimeEpisode = useCallback((value: string) => {
		setactiveEpisodeId(value);
	}, []);
	if (episodesLoading) return <SeasonsTabLoader />;

	const renderCarouselEpisodes = () => (
		<CarouselContent className="space-x-2">
			{visibleEpisodes.map((episode: any) => (
				<AnimeEpisodeCard
					toggleAnimeEpisode={toggleAnimeEpisode}
					key={episode.id}
					episode={episode}
				/>
			))}
		</CarouselContent>
	);

	const renderListEpisodes = () => (
		<>
			{visibleEpisodes.map((episode: any) => (
				<div
					className={cn(
						'p-2 flex flex-col gap-2 border border-transparent rounded-xl hover:pl-2 duration-100 hover:scale-105'
					)}
					key={episode.id}
				>
					<div className="flex line-clamp-1">
						<Badge className="whitespace-nowrap">Episode {episode.number}</Badge>
						<Dot />
						<div className="line-clamp-1 font-bold">{episode.title}</div>
					</div>
					<div className="opacity-50 text-[10px] md:text-xs">
						{format(new Date(episode.createdAt), 'PPP')}
					</div>
					<div className="text-sm text-secondary-foreground">{episode.overview}</div>
				</div>
			))}
		</>
	);
	const renderGridEpisodes = () => (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
			{visibleEpisodes.map((episode: any) => (
				<AnimeEpisodeCard
					toggleAnimeEpisode={toggleAnimeEpisode}
					key={episode.id}
					episode={episode}
				/>
			))}
		</div>
	);

	const renderEpisodes = () => {
		switch (view) {
			case 'grid':
				return renderGridEpisodes();
			case 'list':
				return renderListEpisodes();
			case 'carousel':
				return renderCarouselEpisodes();
			default:
				return null;
		}
	};
	const selectedEpisode = episodes?.find(
		(episode: AnimeEpisode) => episode.id === activeEpisodeId
	);
	return (
		<div className="mx-auto max-w-7xl space-y-10 flex flex-col w-full px-4 md:px-0 ">
			<AnimePlayer episode={selectedEpisode} key={activeEpisodeId} id={activeEpisodeId} />
			<Carousel>
				<div className="flex font-bold justify-between items-center text-xl md:text-2xl py-2 px-4 flex-row">
					<Select onValueChange={(value) => handlePageChange(value)}>
						<div className="flex  justify-between w-full ">
							{totalPages > 1 ? (
								<SelectTrigger className=" w-fit flex  y-4 px-10 gap-2 p-2">
									EP
									<SelectValue className="p-2" />
								</SelectTrigger>
							) : (
								<SelectTrigger
									disabled
									className=" w-fit flex  y-4 px-10 gap-2 p-2"
								>
									{`EP 1 - ${episodes?.length}`}
								</SelectTrigger>
							)}
							<div className="flex gap-2 justify-center items-center">
								<Button
									size="sm"
									variant={view === 'list' ? 'default' : 'secondary'}
									className="text-xs"
									onClick={() => setView('list')}
									aria-label="Switch View"
								>
									<List className="p-1" />
								</Button>
								<Button
									size="sm"
									variant={view === 'grid' ? 'default' : 'secondary'}
									className="text-xs"
									onClick={() => setView('grid')}
									aria-label="Switch View"
								>
									<Grid className="p-1" />
								</Button>
								<Button
									size="sm"
									variant={view === 'carousel' ? 'default' : 'secondary'}
									className="text-xs"
									onClick={() => setView('carousel')}
									aria-label="Switch View"
								>
									<GalleryVerticalEnd className="p-1" />
								</Button>
							</div>
							<SelectContent>
								<SelectGroup>
									{Array.from({ length: totalPages }, (_, index: any) => (
										<SelectItem
											key={index}
											value={index + 1}
											className="relative flex w-full cursor-default select-none items-center py-2.5 pl-2 border-b-[0.2px] pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
										>
											{getRangeText(index + 1)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</div>
					</Select>
				</div>

				<div className="px-3">{renderEpisodes()}</div>
				{view === 'carousel' && (
					<div className="flex gap-2">
						<CarouselPrevious className="h-10 bg-primary text-background w-10" />
						<CarouselNext className="h-10 bg-primary text-background w-10" />
					</div>
				)}
			</Carousel>
		</div>
	);
}
