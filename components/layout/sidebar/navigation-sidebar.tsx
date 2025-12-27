import React from 'react';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { fetchGenres } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { TextGlitch } from '@/components/shared/animated/text-glitch';

const NavigationSidebar = (props: { tvGenre: any; movieGenre: any }) => {
	const { movieGenre, tvGenre } = props;
	return (
		<div>
			<SheetContent className=" overflow-scroll py-10">
				<SheetHeader>
					<SheetTitle className=" p-2 text-xl ">Explore</SheetTitle>
					<SheetDescription>
						<Tabs className=" w-full lg:max-w-[80%]">
							<TabsList className=" flex w-full bg-background" defaultValue={'tv'}>
								<TabsTrigger className="w-full" value="movies">
									Movies{' '}
								</TabsTrigger>
								<TabsTrigger className="w-full" value="tv">
									TV{' '}
								</TabsTrigger>
							</TabsList>
							<TabsContent
								className="gap-2 flex flex-col overflow-auto  h-full"
								value="tv"
							>
								{renderButtons(tvGenre, 'tv')}
							</TabsContent>
							<TabsContent
								className="gap-2 flex flex-col overflow-auto  h-full"
								value="movies"
							>
								{renderButtons(movieGenre, 'movie')}
							</TabsContent>
						</Tabs>
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</div>
	);
};

const renderButtons = (genres: any[], type: string) => {
	return (
		<div>
			<Link href={`/discover/trending?type=${type}&title=Trending`}>
				<SheetTrigger className="w-full">
					<div className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 ">
						Trending
					</div>
				</SheetTrigger>
			</Link>

			<Link href={`/discover/airing-today?type=${type}&title=Airing Today`}>
				<SheetTrigger className="w-full">
					<div className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 ">
						Airing Today
					</div>
				</SheetTrigger>
			</Link>

			<Link href={`/discover/on-the-air?type=${type}&title=On The Air`}>
				<SheetTrigger className="w-full">
					<div className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 ">
						On The Air
					</div>
				</SheetTrigger>
			</Link>

			<Link href={`/discover/popular?type=${type}&title=Popular`}>
				<SheetTrigger className="w-full">
					<div className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 ">
						Popular
					</div>
				</SheetTrigger>
			</Link>

			<Link href={`/discover/top-rated?type=${type}&title=Top Rated`}>
				<SheetTrigger className="w-full">
					<div className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 ">
						Top Rated
					</div>
				</SheetTrigger>
			</Link>
			{genres?.map((genre: any, index: number) => (
				<Link
					key={index}
					className=" cursor-pointer hover:bg-muted rounded  text-start flex p-2 "
					href={`/discover/${genre.name.toLowerCase()}?type=${type}&id=${
						genre.id
					}&title=${encodeURIComponent(genre.name)}`}
				>
					<SheetTrigger className="text-left w-full">
						<TextGlitch>
							<div>{genre.name}</div>
						</TextGlitch>
					</SheetTrigger>
				</Link>
			))}
		</div>
	);
};

export default NavigationSidebar;
