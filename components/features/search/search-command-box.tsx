'use client';

import * as React from 'react';
import {
	ArrowRightIcon,
	Loader2,
	Tv,
	Film,
	X,
	Trash2,
	Star,
	TrendingUp,
	Calendar,
	MonitorPlay,
} from 'lucide-react';
import { cn, searchShows } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import useSearchStore from '@/store/recentsSearchStore';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb-image';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type FilterType = 'all' | 'movie' | 'tv';
type SortType = 'popularity' | 'rating' | 'newest';

export function SearchCommandBox() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [activeFilter, setActiveFilter] = useState<FilterType>('all');
	const [activeSort, setActiveSort] = useState<SortType>('popularity');

	const {
		recentlySearched,
		addToRecentlySearched,
		removeFromRecentlySearched,
		clearRecentlySearched,
	} = useSearchStore();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	useEffect(() => {
		if (open) {
			// Focus input after dialog opens (without causing scroll)
			const timer = setTimeout(() => {
				const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
				if (input) {
					input.focus({ preventScroll: true });
				}
			}, 100);
			return () => clearTimeout(timer);
		} else {
			// Reset state after dialog closes
			setTimeout(() => {
				setQuery('');
				setActiveFilter('all');
				setActiveSort('popularity');
			}, 300);
		}
	}, [open]);

	const {
		data: rawResults,
		isFetching,
		error,
	} = useQuery({
		queryKey: ['search', query, 'multi'],
		queryFn: () => searchShows(query),
		enabled: query.trim().length > 0,
		staleTime: 1000 * 60 * 5,
	});

	const processedResults = useMemo(() => {
		if (!rawResults?.results) return [];
		let filtered = rawResults.results.filter(
			(item: any) => item.media_type === 'tv' || item.media_type === 'movie'
		);

		if (activeFilter !== 'all') {
			filtered = filtered.filter((item: any) => item.media_type === activeFilter);
		}

		return filtered.sort((a: any, b: any) => {
			switch (activeSort) {
				case 'rating':
					return (b.vote_average || 0) - (a.vote_average || 0);
				case 'newest':
					return (
						new Date(b.release_date || b.first_air_date || 0).getTime() -
						new Date(a.release_date || a.first_air_date || 0).getTime()
					);
				default:
					return (b.popularity || 0) - (a.popularity || 0);
			}
		});
	}, [rawResults, activeFilter, activeSort]);

	const debouncedSearch = useCallback(
		debounce((value: string) => setQuery(value), 400),
		[]
	);

	const handleSelectShow = (item: any) => {
		addToRecentlySearched(item);
		setOpen(false);
	};

	const removeItem = (e: React.MouseEvent, id: number | string) => {
		e.stopPropagation();
		removeFromRecentlySearched(id);
	};

	const getFormattedDate = (item: any) => {
		const dateString = item.releaseDate || item.first_air_date || item.release_date;
		return dateString ? new Date(dateString).getFullYear() : '';
	};

	const renderItem = (item: any, isRecent = false) => {
		const show = {
			id: item.id,
			title: item.name || item.title || item.title?.english || 'Unknown Title',
			type: item.media_type || 'anime',
			date: getFormattedDate(item),
			image: item.poster_path || item.coverImage?.medium || item.coverImage?.large,
			rating: item.vote_average ? item.vote_average.toFixed(1) : null,
			overview: item.overview || '',
		};

		return (
			<CommandItem
				key={`${isRecent ? 'recent' : 'search'}-${show.type}-${show.id}`}
				onSelect={() => handleSelectShow(item)}
				value={show.title}
				className="group relative flex items-start gap-4 rounded-card md:rounded-card-md p-2 cursor-pointer transition-all duration-300 aria-selected:bg-white/10 aria-selected:shadow-2xl aria-selected:scale-[1.01] border border-transparent aria-selected:border-white/5 my-1"
			>
				<Link
					href={`/${show.type}/${show.id}`}
					className="flex items-start gap-4 w-full"
					onClick={(e) => {
						e.preventDefault();
						setOpen(false);
						setTimeout(() => {
							window.location.href = `/${show.type}/${show.id}`;
						}, 100);
					}}
				>
					{/* Glass Poster Container - Aspect Ratio 2:3 */}
					<div className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-ui bg-white/5 shadow-inner ring-1 ring-white/10 group-aria-selected:ring-white/30 transition-all">
						{show.image ? (
							<img
								src={tmdbImage(show.image, 'w92')}
								alt={show.title}
								className="h-full w-full object-cover transition-transform duration-500 group-aria-selected:scale-110"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
								{show.type === 'tv' ? (
									<Tv size={16} className="text-white/20" />
								) : (
									<Film size={16} className="text-white/20" />
								)}
							</div>
						)}
						<div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 group-aria-selected:opacity-100 transition-opacity pointer-events-none" />
					</div>

					<div className="flex flex-col flex-1 min-w-0 pt-0.5 gap-0.5">
						<div className="flex items-center justify-between">
							<span className="truncate font-medium text-sm text-white/90 group-aria-selected:text-white transition-colors">
								{show.title}
							</span>
							{isRecent && (
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 -mr-2 text-white/20 hover:text-red-400 hover:bg-transparent transition-colors z-10"
									onClick={(e) => removeItem(e, show.id)}
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2 text-xs text-white/40 group-aria-selected:text-white/60">
							<span className="capitalize text-[10px] font-medium tracking-wide border border-white/10 px-1 rounded bg-white/5">
								{show.type === 'movie' ? 'Movie' : 'TV'}
							</span>
							{show.date && <span>{show.date}</span>}
							{show.rating && (
								<div className="flex items-center gap-1 text-yellow-500/80">
									<Star className="w-2.5 h-2.5 fill-current" />
									<span>{show.rating}</span>
								</div>
							)}
						</div>

						{!isRecent && show.overview && (
							<p className="text-[10px] text-white/30 line-clamp-1 mt-1 font-light pr-4 group-aria-selected:text-white/50">
								{show.overview}
							</p>
						)}
					</div>

					{!isRecent && (
						<ArrowRightIcon className="self-center w-4 h-4 text-white/0 -translate-x-2 transition-all duration-300 group-aria-selected:opacity-50 group-aria-selected:translate-x-0 group-aria-selected:text-white" />
					)}
				</Link>
			</CommandItem>
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className={cn(
						// Mobile: Icon only
						'h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all',
						// Desktop: Full search box
						'lg:relative lg:h-10 lg:w-64 lg:justify-start lg:gap-2 lg:rounded-card md:lg:rounded-card-md lg:px-4 lg:font-normal lg:shadow-sm lg:backdrop-blur-md'
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="size-4 opacity-50"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.3-4.3" />
					</svg>
					<span className="hidden lg:inline-flex">Search...</span>
					<kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-black/20 px-1.5 font-mono text-[10px] font-medium opacity-50 lg:flex">
						<span className="text-xs">⌘</span>K
					</kbd>
				</Button>
			</DialogTrigger>

			<DialogContent className="p-0 overflow-hidden bg-transparent border-none shadow-none max-w-xl w-full">
				<DialogHeader className="sr-only">
					<DialogTitle>Search</DialogTitle>
				</DialogHeader>

				<Command
					className="w-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-dialog md:rounded-dialog-md overflow-hidden ring-1 ring-white/5"
					shouldFilter={false}
				>
					<CommandInput
						placeholder="Movies, shows, anime..."
						onValueChange={(v) => debouncedSearch(v)}
						autoFocus={false}
					/>
					<div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
						<div className="flex items-center p-0.5 bg-black/20 rounded-ui md:rounded-ui-md border border-white/5">
							{(['all', 'movie', 'tv'] as FilterType[]).map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveFilter(tab)}
									className={cn(
										'relative px-3 py-1 text-[10px] font-medium transition-colors rounded-ui min-w-[50px] z-10',
										activeFilter === tab
											? 'text-white'
											: 'text-white/40 hover:text-white/70'
									)}
								>
									{activeFilter === tab && (
										<motion.div
											{...({ layoutId: 'active-pill' } as any)}
											className="absolute inset-0 bg-white/10 rounded-[4px] -z-10 border border-white/5 shadow-sm"
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 30,
											}}
										/>
									)}
									{tab === 'all' ? 'All' : tab === 'movie' ? 'Movies' : 'TV'}
								</button>
							))}
						</div>
						<div className="flex items-center gap-1">
							{[
								{ id: 'popularity', icon: TrendingUp, label: 'Popular' },
								{ id: 'rating', icon: Star, label: 'Top Rated' },
								{ id: 'newest', icon: Calendar, label: 'Newest' },
							].map((sort) => (
								<button
									key={sort.id}
									onClick={() => setActiveSort(sort.id as SortType)}
									title={sort.label}
									className={cn(
										'p-1.5 rounded-ui transition-all',
										activeSort === sort.id
											? 'bg-white/10 text-white shadow-sm'
											: 'text-white/20 hover:text-white/60'
									)}
								>
									<sort.icon className="w-3.5 h-3.5" />
								</button>
							))}
						</div>
					</div>

					<div className="min-h-[350px] relative">
						<CommandList className="max-h-[55vh] overflow-y-auto p-2 scrollbar-none">
							{isFetching && (
								<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30 bg-black/40 backdrop-blur-[2px] z-20">
									<Loader2 className="w-8 h-8 animate-spin text-white/50" />
									<p className="text-[10px] font-medium uppercase tracking-widest">
										Searching Multiverse...
									</p>
								</div>
							)}

							{error && (
								<div className="py-20 text-center text-red-400/80 flex flex-col items-center gap-2">
									<X className="w-10 h-10 opacity-20" />
									<p className="text-sm">Network error.</p>
								</div>
							)}

							{!isFetching && !error && (
								<>
									{/* Empty State: Initial */}
									{!query && recentlySearched.length === 0 && (
										<div className="py-20 flex flex-col items-center justify-center text-center opacity-100">
											<div className="h-16 w-16 rounded-card md:rounded-card-md bg-gradient-to-tr from-white/10 to-transparent border border-white/5 flex items-center justify-center mb-4 shadow-2xl shadow-indigo-500/10">
												<MonitorPlay className="w-8 h-8 text-white/30" />
											</div>
											<h3 className="text-base font-medium text-white/90">
												What to watch?
											</h3>
											<p className="text-xs text-white/40 mt-1 max-w-[200px]">
												Search for movies, TV shows, and anime.
											</p>
										</div>
									)}

									{!query && recentlySearched.length > 0 && (
										<CommandGroup
											heading={
												<div className="flex items-center justify-between px-1">
													<span>Recent</span>
													<button
														onClick={clearRecentlySearched}
														className="flex items-center gap-1 text-[9px] text-white/20 hover:text-red-300 transition-colors uppercase tracking-wider font-bold"
													>
														<Trash2 className="w-2.5 h-2.5" /> Clear
													</button>
												</div>
											}
										>
											{recentlySearched.map((item: any) =>
												renderItem(item, true)
											)}
										</CommandGroup>
									)}

									{query && processedResults.length === 0 && (
										<CommandEmpty className="py-12 text-center text-white/40 flex flex-col items-center gap-3">
											<div className="p-3 rounded-full bg-white/5 border border-white/5">
												<X className="w-5 h-5 opacity-50" />
											</div>
											<span>
												No results found for &quot;
												<span className="text-white/70">{query}</span>&quot;
											</span>
										</CommandEmpty>
									)}

									{query && processedResults.length > 0 && (
										<CommandGroup
											heading={`Results (${processedResults.length})`}
										>
											<AnimatePresence mode="popLayout">
												{processedResults.map((item: any) => (
													<motion.div
														key={item.id}
														layout
														initial={{ opacity: 0, scale: 0.98 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.98 }}
														transition={{ duration: 0.2 }}
													>
														{renderItem(item)}
													</motion.div>
												))}
											</AnimatePresence>
										</CommandGroup>
									)}
								</>
							)}
						</CommandList>
					</div>
					<div className="border-t border-white/5 bg-white/[0.02] px-4 py-2.5 flex justify-between items-center z-10">
						<div className="flex gap-3 text-[10px] text-white/30 font-medium">
							<span className="flex items-center gap-1">
								<kbd className="bg-white/5 border border-white/10 px-1 rounded font-sans text-white/50 min-w-[18px] text-center">
									↑↓
								</kbd>{' '}
								Select
							</span>
							<span className="flex items-center gap-1">
								<kbd className="bg-white/5 border border-white/10 px-1 rounded font-sans text-white/50 min-w-[18px] text-center">
									↵
								</kbd>{' '}
								Open
							</span>
						</div>
						{query && (
							<Link
								href={`/search?q=${query}`}
								className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1 group"
								onClick={() => setOpen(false)}
							>
								See all results{' '}
								<ArrowRightIcon className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
							</Link>
						)}
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
