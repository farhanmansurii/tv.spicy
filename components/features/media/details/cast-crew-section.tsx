'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbImage } from '@/lib/tmdb-image';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import CommonTitle from '@/components/shared/animated/common-title';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchCreditsClient } from '@/lib/utils';
import CastCrewLoader from '@/components/shared/loaders/cast-crew-loader';

interface CastMember {
	id: number;
	name: string;
	character?: string;
	profile_path: string | null;
	order: number;
}

interface CrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path: string | null;
}

interface CastCrewSectionProps {
	id: string;
	type: string;
}

function CastCrewContent({ cast, crew }: { cast: CastMember[]; crew: CrewMember[] }) {
	const topCast = cast?.slice(0, 10) || [];
	const directors = crew?.filter((person) => person.job === 'Director') || [];
	const writers =
		crew?.filter((person) => person.job === 'Writer' || person.job === 'Screenplay') || [];
	const producers =
		crew?.filter((person) => person.job === 'Producer' || person.department === 'Production') ||
		[];

	if (topCast.length === 0 && directors.length === 0 && writers.length === 0) {
		return null;
	}

	return (
		<div className="w-full space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
			{/* Cast Section */}
			{topCast.length > 0 && (
				<div className="space-y-6">
					<CommonTitle text="Cast" />
					<Carousel
						opts={{
							align: 'start',
							dragFree: true,
							loop: false,
						}}
						className="w-full group/row relative"
					>
						<CarouselPrevious
							className="hidden lg:flex absolute left-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full"
							icon={<ChevronLeft className="h-8 w-8" />}
						/>
						<CarouselNext
							className="hidden lg:flex absolute right-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full"
							icon={<ChevronRight className="h-8 w-8" />}
						/>
						<CarouselContent className="-ml-4 items-start">
							{topCast.map((actor, index) => (
								<CarouselItem
									key={`cast-${actor.id}-${index}`}
									className="pl-4 basis-[28%] md:basis-1/5 lg:basis-1/6 xl:basis-1/7"
								>
									<div className="flex flex-col gap-2 w-full group">
										{/* Actor Photo */}
										<div className="relative aspect-[2/3] w-full overflow-hidden rounded-card md:rounded-card-md bg-black/40 shadow-lg ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.03] group-hover:ring-white/20">
											{actor.profile_path ? (
												<img
													src={tmdbImage(actor.profile_path, 'w500')}
													alt={actor.name}
													loading="lazy"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="flex items-center justify-center w-full h-full bg-white/5 text-white/30">
													<span className="text-[10px] font-medium">
														No Photo
													</span>
												</div>
											)}
											<div className="absolute inset-0 rounded-card md:rounded-card-md ring-1 ring-inset ring-white/10 pointer-events-none" />
										</div>

										{/* Actor Info */}
										<div className="flex flex-col gap-1 px-0.5">
											<h3 className="text-sm font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
												{actor.name}
											</h3>
											{actor.character && (
												<p className="text-xs text-muted-foreground/70 truncate leading-tight font-medium">
													{actor.character}
												</p>
											)}
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				</div>
			)}

			{/* Crew Section */}
			{(directors.length > 0 || writers.length > 0 || producers.length > 0) && (
				<div className="space-y-6">
					<CommonTitle text="Crew" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Directors */}
						{directors.length > 0 && (
							<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-card md:rounded-card-md p-4 md:p-6 space-y-3 shadow-lg ring-1 ring-white/5">
								<h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
									Directors
								</h4>
								<div className="flex flex-wrap gap-2">
									{directors.slice(0, 5).map((director, index) => (
										<span
											key={`director-${director.id}-${index}`}
											className="text-sm font-medium text-white/90 hover:text-white transition-colors"
										>
											{director.name}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Writers */}
						{writers.length > 0 && (
							<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-card md:rounded-card-md p-4 md:p-6 space-y-3 shadow-lg ring-1 ring-white/5">
								<h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
									Writers
								</h4>
								<div className="flex flex-wrap gap-2">
									{writers.slice(0, 5).map((writer, index) => (
										<span
											key={`writer-${writer.id}-${index}`}
											className="text-sm font-medium text-white/90 hover:text-white transition-colors"
										>
											{writer.name}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Producers */}
						{producers.length > 0 && (
							<div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-card md:rounded-card-md p-4 md:p-6 space-y-3 shadow-lg ring-1 ring-white/5">
								<h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
									Producers
								</h4>
								<div className="flex flex-wrap gap-2">
									{producers.slice(0, 5).map((producer, index) => (
										<span
											key={`producer-${producer.id}-${index}`}
											className="text-sm font-medium text-white/90 hover:text-white transition-colors"
										>
											{producer.name}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default function CastCrewSection({ id, type }: CastCrewSectionProps) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['credits', id, type],
		queryFn: () => fetchCreditsClient(id, type),
		enabled: !!id && !!type,
		staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
		gcTime: 1000 * 60 * 60 * 24 * 7,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (isLoading) {
		return (
			<div className="w-full">
				<CastCrewLoader />
			</div>
		);
	}

	if (error || !data) {
		return null;
	}

	const cast = data.cast || [];
	const crew = data.crew || [];

	if (cast.length === 0 && crew.length === 0) {
		return null;
	}

	return (
		<div className="w-full">
			<CastCrewContent cast={cast} crew={crew} />
		</div>
	);
}
