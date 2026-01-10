'use client';

import * as React from 'react';
import gsap from 'gsap';
import {
	Search,
	X,
	Star,
	Film,
	Clock,
	ChevronRight,
	Command as CmdIcon,
	Loader2,
	AlertCircle,
	ArrowRight,
} from 'lucide-react';
import { debounce } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { searchShows } from '@/lib/tmdb-fetch-helper';
import { tmdbImage } from '@/lib/tmdb-image';
import useSearchStore from '@/store/recentsSearchStore';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, VisuallyHidden } from '@/components/ui/dialog';
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandInput,
} from '@/components/ui/command';

const APPLE_FLUID = 'expo.out';

interface SearchCommandBoxProps {
	variant?: 'default' | 'expanded';
}

export function SearchCommandBox({ variant = 'default' }: SearchCommandBoxProps) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState('');
	const [debouncedQuery, setDebouncedQuery] = React.useState('');
	const [filter, setFilter] = React.useState<'all' | 'movie' | 'tv'>('all');
	const [showLoader, setShowLoader] = React.useState(false);

	const containerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const animationRef = React.useRef<gsap.core.Tween | null>(null);
	const prevResultsLengthRef = React.useRef(0);
	const loaderTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const { recentlySearched, removeFromRecentlySearched, addToRecentlySearched } = useSearchStore();

	const debouncedSetQuery = React.useMemo(
		() => debounce((v: string) => setDebouncedQuery(v), 500),
		[]
	);

	React.useEffect(() => {
		if (open && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		} else if (!open) {
			setInputValue('');
			setDebouncedQuery('');
			setFilter('all');
			setShowLoader(false);
			debouncedSetQuery.cancel();
			if (animationRef.current) {
				animationRef.current.kill();
				animationRef.current = null;
			}
			if (loaderTimeoutRef.current) {
				clearTimeout(loaderTimeoutRef.current);
				loaderTimeoutRef.current = null;
			}
			prevResultsLengthRef.current = 0;
		}
	}, [open, debouncedSetQuery]);

	React.useEffect(() => {
		return () => {
			if (animationRef.current) {
				animationRef.current.kill();
			}
			debouncedSetQuery.cancel();
		};
	}, [debouncedSetQuery]);

	const { data, isFetching, isError } = useQuery({
		queryKey: ['search', debouncedQuery],
		queryFn: () => searchShows(debouncedQuery),
		enabled: debouncedQuery.length > 1,
		placeholderData: (previousData) => previousData,
		staleTime: 5000,
	});

	const isSearching = isFetching && debouncedQuery !== '';

	React.useEffect(() => {
		if (loaderTimeoutRef.current) {
			clearTimeout(loaderTimeoutRef.current);
			loaderTimeoutRef.current = null;
		}

		if (isSearching) {
			loaderTimeoutRef.current = setTimeout(() => {
				setShowLoader(true);
			}, 300);
		} else {
			if (showLoader) {
				loaderTimeoutRef.current = setTimeout(() => {
					setShowLoader(false);
				}, 200);
			} else {
				setShowLoader(false);
			}
		}

		return () => {
			if (loaderTimeoutRef.current) {
				clearTimeout(loaderTimeoutRef.current);
			}
		};
	}, [isSearching, showLoader]);

	const results = React.useMemo(() => {
		const raw = (data?.results as any[]) || [];
		return raw.filter((i) => filter === 'all' || i.media_type === filter).slice(0, 8);
	}, [data, filter]);

	React.useLayoutEffect(() => {
		if (!containerRef.current || !open) return;

		const hasResults = results.length > 0;
		const hasRecentSearches = !debouncedQuery && recentlySearched.length > 0;
		const hasContent = hasResults || hasRecentSearches || isSearching;
		const currentResultsLength =
			results.length + (debouncedQuery ? 0 : recentlySearched.length);
		const shouldAnimate = currentResultsLength !== prevResultsLengthRef.current && hasContent;
		prevResultsLengthRef.current = currentResultsLength;

		if (animationRef.current) {
			animationRef.current.kill();
			animationRef.current = null;
		}

		if (shouldAnimate && hasContent) {
			const startHeight = containerRef.current.offsetHeight;
			gsap.set(containerRef.current, { height: 'auto' });
			const endHeight = containerRef.current.offsetHeight;
			gsap.set(containerRef.current, { height: startHeight });

			requestAnimationFrame(() => {
				if (containerRef.current) {
					animationRef.current = gsap.to(containerRef.current, {
						height: endHeight,
						duration: 0.4,
						ease: APPLE_FLUID,
						overwrite: true,
						onComplete: () => {
							if (containerRef.current) {
								gsap.set(containerRef.current, { clearProps: 'height' });
							}
							animationRef.current = null;
						},
					});
				}
			});
		} else if (!hasContent) {
			gsap.set(containerRef.current, { clearProps: 'height' });
		}

		const items = containerRef.current.querySelectorAll('.search-item-anim:not(.animated)');
		if (items.length > 0) {
			items.forEach((item) => item.classList.add('animated'));
			gsap.fromTo(
				items,
				{ opacity: 0, y: 8, filter: 'blur(4px)', scale: 0.99 },
				{
					opacity: 1,
					y: 0,
					filter: 'blur(0px)',
					scale: 1,
					duration: 0.3,
					stagger: 0.02,
					ease: 'power2.out',
					clearProps: 'all',
				}
			);
		}
	}, [results.length, recentlySearched.length, debouncedQuery, open, isSearching]);

	const handleInputChange = (v: string) => {
		setInputValue(v);
		if (v.length === 0) {
			setDebouncedQuery('');
			debouncedSetQuery.cancel();
		} else {
			debouncedSetQuery(v);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{variant === 'expanded' ? (
					// Expanded variant - Full width search bar (for sidebar/mobile menu)
					<button
						className={cn(
							'relative flex items-center w-full',
							'h-11 rounded-xl px-3.5 gap-3',
							'bg-foreground/[0.04] hover:bg-foreground/[0.06] active:bg-foreground/[0.08]',
							'border border-border/40 hover:border-border/50',
							'transition-all duration-300 ease-out',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
							'touch-manipulation',
							'group'
						)}
					>
						<Search
							className={cn(
								'h-[18px] w-[18px]',
								'text-muted-foreground/50 group-hover:text-muted-foreground/70',
								'transition-colors duration-300',
								'flex-shrink-0'
							)}
							strokeWidth={1.75}
						/>
						<span className="flex-1 text-left text-[14px] text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors">
							Search movies, shows...
						</span>
					</button>
				) : (
					// Default variant - Icon button on mobile, expanded on desktop
					<button
						className={cn(
							// Mobile: Circular icon button
							'relative flex items-center justify-center',
							'h-10 w-10 sm:h-11 sm:w-11 rounded-full',
							'bg-foreground/[0.03] hover:bg-foreground/[0.06] active:bg-foreground/[0.08]',
							'border border-border/40 hover:border-border/60',
							'transition-all duration-300 ease-out',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
							'touch-manipulation',
							'group',
							// Desktop: Expanded search bar
							'lg:w-64 lg:h-10 lg:rounded-xl lg:justify-start lg:gap-2.5 lg:px-3.5'
						)}
					>
						<Search
							className={cn(
								'h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-4 lg:w-4',
								'text-foreground/60 group-hover:text-foreground/80',
								'transition-colors duration-300',
								'flex-shrink-0'
							)}
							strokeWidth={1.75}
						/>
						<span className="hidden lg:inline-flex text-[14px] text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors">
							Search...
						</span>
						<kbd className={cn(
							'pointer-events-none absolute right-2.5 hidden lg:flex',
							'h-5 items-center gap-0.5 rounded-md',
							'bg-foreground/[0.04] border border-border/30',
							'px-1.5 font-mono text-[10px] font-medium',
							'text-muted-foreground/40'
						)}>
							<span className="text-[11px]">⌘</span>K
						</kbd>
					</button>
				)}
			</DialogTrigger>
			<DialogContent className="p-0 border-none bg-transparent max-w-2xl top-[15%] translate-y-0 shadow-none outline-none overflow-visible">
				<VisuallyHidden>
					<DialogTitle>Search movies and TV shows</DialogTitle>
				</VisuallyHidden>
				<div
					ref={containerRef}
					className="bg-[#0C0C0C]/80 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] flex flex-col will-change-[height]"
				>
					<Command shouldFilter={false} className="bg-transparent h-auto">
						<div className="flex items-center px-4  border-b border-white/5 shrink-0 gap-2">
							<div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
								<Search
									className={cn(
										'absolute w-5 h-5 transition-all duration-300 pointer-events-none',
										isSearching
											? 'opacity-0 scale-50'
											: 'opacity-100 scale-100 text-white/20'
									)}
								/>
								<Loader2
									className={cn(
										'absolute w-6 h-6 animate-spin transition-all duration-300 pointer-events-none',
										isSearching
											? 'opacity-100 scale-100 text-blue-500'
											: 'opacity-0 scale-50'
									)}
								/>
							</div>
							<CommandInput
								ref={inputRef}
								placeholder="Search movies, TV shows..."
								value={inputValue}
								showSearchIcon={false}
								onValueChange={handleInputChange}
								className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-xl h-full placeholder:text-white/5 text-white/90"
							/>
							{inputValue && (
								<div className="flex pr-10 items-center gap-3 animate-in fade-in zoom-in duration-300">
									{/* Visual Separator - very Apple */}
									<div className="w-[1px] h-6 bg-white/5" />

									<button
										onClick={() => handleInputChange('')}
										className="group/clear relative p-2 flex items-center gap-2 hover:bg-white/10 rounded-full transition-all active:scale-95"
										title="Clear search"
									>
										<span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
											Clear
										</span>
										{/* Subtle outer ring on hover */}
										<span className="absolute inset-0 rounded-full border border-white/0 group-hover/clear:border-white/10 transition-all" />
									</button>
								</div>
							)}
						</div>
						<div className="flex gap-2 p-2 bg-white/[0.02] border-b border-white/5">
							{(['all', 'movie', 'tv'] as const).map((t) => (
								<button
									key={t}
									onClick={() => setFilter(t)}
									className={cn(
										'px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-widest',
										filter === t
											? 'text-white bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
											: 'text-white/30 hover:text-white/50'
									)}
								>
									{t === 'all'
										? 'Everything'
										: t === 'movie'
											? 'Movies'
											: 'TV Shows'}
								</button>
							))}
						</div>
						<CommandList className="max-h-[480px] overflow-y-auto p-0 custom-scrollbar min-h-[120px]">
							{isError && (
								<div className="py-20 flex flex-col items-center text-red-400/50">
									<AlertCircle className="w-8 h-8 mb-2" />
									<span className="text-[10px] font-bold uppercase tracking-widest">
										Network Error
									</span>
								</div>
							)}
							{!debouncedQuery && !isSearching && (
								<>
									<CommandGroup
										heading={
											<span className="px-3 py-3 text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">
												Recently Viewed
											</span>
										}
									>
										{recentlySearched.length > 0 ? (
											recentlySearched.map((item: any) => (
												<ResultItem
													key={`recent-${item.id}`}
													item={item}
													isRecent
													onRemove={() => removeFromRecentlySearched(item.id)}
													onSelect={() => {
														const mediaType = item.media_type || 'movie';
														router.push(`/${mediaType}/${item.id}`);
														setOpen(false);
													}}
												/>
											))
										) : (
											<div className="py-10 text-center text-white/5 text-xs italic">
												No recent searches
											</div>
										)}
									</CommandGroup>
									{/* Go to Search Page Option */}
									<CommandGroup>
										<CommandItem
											onSelect={() => {
												router.push('/search');
												setOpen(false);
											}}
											className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all aria-selected:bg-white/10 group mx-1 mb-1 outline-none border-t border-white/5 mt-2"
										>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
													<Search className="w-5 h-5 text-white/40" />
												</div>
												<div className="flex flex-col">
													<span className="text-sm font-semibold text-white/80 group-aria-selected:text-white">
														Open Search Page
													</span>
													<span className="text-[10px] font-medium text-white/20">
														Browse all content with filters
													</span>
												</div>
											</div>
											<ArrowRight className="w-4 h-4 text-white/30 group-aria-selected:text-white/40 transition-colors flex-shrink-0 ml-2" />
										</CommandItem>
									</CommandGroup>
								</>
							)}
							{debouncedQuery && !isError && (
								<>
									{showLoader ? (
										<div className="py-20 flex flex-col items-center justify-center min-h-[120px]">
											<Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
											<span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
												Searching...
											</span>
										</div>
									) : results.length > 0 ? (
										<>
											<CommandGroup
												heading={
													<span className="px-3 py-3 text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">
														Matches
													</span>
												}
											>
												{results.map((item: any) => (
													<ResultItem
														key={item.id}
														item={item}
														onSelect={() => {
															const mediaType = item.media_type || 'movie';
															router.push(`/${mediaType}/${item.id}`);
															setOpen(false);
															addToRecentlySearched(item);
														}}
													/>
												))}
											</CommandGroup>
											{/* Go to Search Page Option */}
											<CommandGroup>
												<CommandItem
													onSelect={() => {
														router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
														setOpen(false);
													}}
													className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all aria-selected:bg-white/10 group mx-1 mb-1 outline-none border-t border-white/5 mt-2"
												>
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
															<Search className="w-5 h-5 text-white/40" />
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-semibold text-white/80 group-aria-selected:text-white">
																View All Results
															</span>
															<span className="text-[10px] font-medium text-white/20">
																See all matches for &quot;{debouncedQuery}&quot;
															</span>
														</div>
													</div>
													<ArrowRight className="w-4 h-4 text-white/30 group-aria-selected:text-white transition-colors" />
												</CommandItem>
											</CommandGroup>
										</>
									) : (
										<div className="py-20 text-center text-white/20 text-sm min-h-[120px] flex items-center justify-center">
											No results found for{' '}
											<span className="text-white/50">
												&quot;{debouncedQuery}&quot;
											</span>
										</div>
									)}
								</>
							)}
						</CommandList>

						<div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
							<div className="flex gap-4">
								<span className="flex items-center gap-1.5">
									<CmdIcon className="w-3 h-3" /> Select
								</span>
								<span className="flex items-center gap-1.5">
									<ChevronRight className="w-3 h-3 rotate-90" /> Navigate
								</span>
							</div>
						</div>
					</Command>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ResultItem({ item, isRecent, onRemove, onSelect }: any) {
	const year = (item.release_date || item.first_air_date || '').split('-')[0];
	const title = item.title || item.name || 'Untitled';
	const mediaType = item.media_type === 'movie' ? 'Movie' : item.media_type === 'tv' ? 'TV Show' : 'Media';

	return (
		<div className="px-1 py-1">
			<CommandItem
				onSelect={onSelect}
				className="group relative flex items-center gap-3.5 p-1.5 rounded-2xl
					bg-gradient-to-br from-white/[0.02] to-white/[0.01]
					hover:from-white/[0.05] hover:to-white/[0.02]
					aria-selected:from-white/[0.08] aria-selected:to-white/[0.04]
					border border-white/[0.04] hover:border-white/[0.08]
					aria-selected:border-white/[0.12]
					backdrop-blur-xl shadow-lg shadow-black/5
					hover:shadow-xl hover:shadow-black/10
					aria-selected:shadow-2xl aria-selected:shadow-black/20
					transition-all duration-300 ease-out
					cursor-pointer outline-none overflow-hidden"
			>
				{/* Poster Image - 2:3 Aspect Ratio */}
				<div className="relative w-12 aspect-[2/3] rounded-lg overflow-hidden
					bg-gradient-to-br from-white/[0.03] to-white/[0.01]
					border border-white/[0.08] flex-shrink-0 shadow-md
					group-hover:shadow-xl group-hover:scale-[1.02]
					transition-all duration-300">
					{item.poster_path ? (
						<>
							<img
								src={tmdbImage(item.poster_path, 'w92')}
								className="w-full h-full object-cover"
								alt=""
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-gradient-to-t
								from-black/30 via-transparent to-transparent" />
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Film className="w-6 h-6 text-white/[0.08]" strokeWidth={1.5} />
						</div>
					)}
				</div>

				{/* Content Area */}
				<div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
					{/* Title */}
					<h3 className="text-[13.5px] font-semibold text-white/90
						group-hover:text-white/95 group-aria-selected:text-white
						truncate leading-tight tracking-tight
						transition-colors duration-200">
						{title}
					</h3>

					{/* Metadata Row */}
					<div className="flex items-center gap-2 text-[11px] font-medium">
						{/* Media Type Badge */}
						<span className="px-2 py-0.5 rounded-md
							bg-white/[0.06] group-aria-selected:bg-white/[0.08]
							text-white/40 group-aria-selected:text-white/50
							uppercase tracking-wider text-[10px] font-bold
							transition-colors duration-200">
							{mediaType}
						</span>

						{/* Year */}
						{year && (
							<span className="text-white/30 font-semibold">
								{year}
							</span>
						)}

						{/* Rating */}
						{item.vote_average > 0 && (
							<div className="flex items-center gap-1 ml-auto">
								<div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md
									bg-amber-500/10 group-aria-selected:bg-amber-500/15
									transition-colors duration-200">
									<Star className="w-3 h-3 text-amber-400/70 fill-amber-400/70"
										strokeWidth={0} />
									<span className="text-amber-400/90 font-bold text-[11px]">
										{item.vote_average.toFixed(1)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* Overview/Description (optional, can be toggled) */}
					{item.overview && (
						<p className="text-[11px] text-white/25 leading-relaxed
							line-clamp-1 group-hover:text-white/30
							transition-colors duration-200">
							{item.overview}
						</p>
					)}
				</div>

				{/* Right Side Actions */}
				<div className="flex items-center gap-1.5 flex-shrink-0">
					{/* Remove Button (for recent searches) */}
					{isRecent && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onRemove();
							}}
							className="opacity-0 group-hover:opacity-100
								p-1.5 rounded-lg
								hover:bg-red-500/10 active:bg-red-500/20
								text-white/20 hover:text-red-400/80
								transition-all duration-200"
							aria-label="Remove"
						>
							<X className="w-3.5 h-3.5" strokeWidth={2.5} />
						</button>
					)}

					{/* Chevron Indicator */}
					<div className="p-1">
						<ChevronRight className="w-4 h-4 text-white/10
							group-hover:text-white/20 group-aria-selected:text-white/30
							group-hover:translate-x-0.5 group-aria-selected:translate-x-1
							transition-all duration-200"
							strokeWidth={2.5} />
					</div>
				</div>

				{/* Subtle Glow Effect on Selection */}
				<div className="absolute inset-0 rounded-2xl opacity-0
					group-aria-selected:opacity-100 pointer-events-none
					bg-gradient-to-r from-transparent via-white/[0.01] to-transparent
					transition-opacity duration-500" />
			</CommandItem>
		</div>
	);
}
