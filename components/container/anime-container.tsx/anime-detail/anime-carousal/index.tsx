'use client';
import CardLoader from '@/components/common/CardLoader';
import CarousalCardWrapper from '@/components/common/DetailsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchData } from '@/lib/anime-helpers';
import { Anime } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { error } from 'console';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { FaPlay } from 'react-icons/fa';

export default function AnimeCarousal() {
	const {
		data: animedata,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['animeRow', 'trending'],
		queryFn: () => fetchData('trending'),
	});
	if (isLoading)
		return (
			<>
				<div className="flex md:hidden z-20 h-[70vh] relative">
					<Skeleton className="absolute inset-0" />
				</div>
				<div className="relative h-[70vh] md:flex hidden mx-auto ">
					<Skeleton className="absolute inset-0" />
				</div>
			</>
		);
	if (isError) return <div>Error</div>;
	return (
		<Carousel className="mb-10 ">
			<CarouselContent className="w-full mx-auto flex ">
				{animedata?.results.map((el: Anime) => (
					<CarouselItem key={el.id}>
						<AnimeCarouselCard show={el} />
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}

const AnimeCarouselCard = ({ show }: { show: Anime }) => {
	const title = show.title.userPreferred || show.title.english || 'Untitled';
	const rating = (show.rating / 10).toFixed(1);

	return (
		<>
			<div className="flex md:hidden h-[70vh] relative">
				<CarousalCardWrapper.Image
					alt={title}
					className="inset-0 object-cover rounded-t-xl h-full w-full"
					src={show.image}
				/>
				<div className="border-white absolute gap-1 flex justify-between bg-gradient-to-t from-background to-transparent bottom-0 top-1 w-full flex-col">
					<div className="flex gap-3 h-full justify-end items-center flex-col">
						<CarousalCardWrapper.Title className="line-clamp-3" title={title} />
						<div className="flex items-center gap-2 flex-wrap">
							<div className="flex gap-0">
								{show.type && (
									<Badge
										variant="secondary"
										className=" rounded-none whitespace-nowrap"
									>
										{show.type}
									</Badge>
								)}
								{show.releaseDate && (
									<Badge className="whitespace-nowrap rounded-none ">
										{show.releaseDate}
									</Badge>
								)}
								<Badge className="rounded-none ">
									{show.status === 'Completed' ? 'Finished' : 'Ongoing'}
								</Badge>
								<Badge className="rounded-none ">{rating}</Badge>
							</div>
						</div>
					</div>
					<ContinueWatchingButton id={show.id} />
				</div>
			</div>
			<div className="relative h-[70vh] md:flex hidden w-full mx-auto">
				<CarousalCardWrapper.Image
					alt={title}
					className="h-full w-full rounded-t-xl object-center object-cover"
					src={show.cover}
				/>
				<div className="inset-0 bg-gradient-to-t from-background to-from-background/10 absolute justify-between flex flex-col">
					<div></div>
					<div className="w-[96%] mx-auto">
						<div className="flex gap-1 flex-col uppercase w-[500px] text-pretty">
							<div className="text-sm normal-case opacity-50">{show.releaseDate}</div>
							<div className="text-3xl text-pretty font-bold">{title}</div>
							<div className="flex items-center gap-2 flex-wrap">
								{show.genres?.slice(0, 3).map((genre) => (
									<Badge key={genre} className="whitespace-nowrap">
										{genre}
									</Badge>
								))}
								<Separator orientation="vertical" />
								{show.type && (
									<Badge variant="secondary" className="whitespace-nowrap">
										{show.type}
									</Badge>
								)}
							</div>
							{show.description && (
								<CarousalCardWrapper.Details overview={show.description} />
							)}
							<div className="flex my-2 gap-2">
								<ContinueWatchingButton id={show.id} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const ContinueWatchingButton = ({ id }: { id: string }) => {
	return (
		<div className="flex w-full items-center justify-center flex-row md:w-fit gap-0">
			<Link href={`/anime/${id}`}>
				<Button
					iconPlacement="right"
					variant={'expandIcon'}
					Icon={ArrowRight}
					className="whitespace-nowrap rounded-none  w-full"
				>
					Go To Show
				</Button>
			</Link>
			<Button
				iconPlacement="right"
				variant={'expandIcon'}
				Icon={Plus}
				className=" bg-secondary text-secondary-foreground rounded-none lg:w-fit hover:bg-secondary/80 whitespace-nowrap"
				//   onClick={handleAddOrRemove}
			>
				{/* {isAdded ? "Added" : " Add to WatchList"} */}
				Add to List
			</Button>
		</div>
	);
};
