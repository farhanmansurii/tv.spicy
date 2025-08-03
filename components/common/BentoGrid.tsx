/* eslint-disable @next/next/no-img-element */
'use client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { cn } from '@/lib/utils';
import CommonTitle from '../animated-common/CommonTitle';
import ShowCard from './Card';
import CommonContainer from '../container/CommonContainer';

type Props = {
	title: string;
	shows: Show[];
	type: string;
};

export default function BentoGrid({ title, shows, type }: Props) {
	if (!shows?.length) return null;

	return (
		<CommonContainer className=" mx-auto">
			<Carousel
				opts={{ dragFree: true }}
				className="ease-in-out duration-100 w-[99%] mx-auto"
			>
				<div className="flex items-center justify-between gap-4 py-2 md:py-4 mx-auto">
					<CommonTitle shouldWrap={false} text={title} />

					<div className="flex items-center gap-2">
						<CarouselPrevious
							variant="outline"
							className="w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition"
						/>
						<CarouselNext
							variant="outline"
							className="w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition"
						/>
					</div>
				</div>

				<CarouselContent className="gap-2">
					{shows.map(
						(show: Show, index: number) =>
							show?.backdrop_path && (
								<CarouselItem
									className={cn(
										`group basis-9/12 w-full md:basis-1/3 lg:basis-[30%]`
									)}
									key={show.id}
								>
									<ShowCard
										key={show.id}
										type={type}
										show={show}
										index={index}
										isVertical={false}
									/>
								</CarouselItem>
							)
					)}
				</CarouselContent>
			</Carousel>
		</CommonContainer>
	);
}
