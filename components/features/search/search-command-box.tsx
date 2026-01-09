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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
				<div
					ref={containerRef}
					className="bg-[#0C0C0C]/80 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] flex flex-col will-change-[height]"
				>
					<Command shouldFilter={false} className="bg-transparent h-auto">
						<div className="flex items-center px-4 h-20 border-b border-white/5 shrink-0 gap-2">
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
						<div className="flex gap-2 p-3 bg-white/[0.02] border-b border-white/5">
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
						<CommandList className="max-h-[480px] overflow-y-auto px-3 pb-3 custom-scrollbar min-h-[120px]">
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
																See all matches for "{debouncedQuery}"
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
												"{debouncedQuery}"
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

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (onSelect)
			onSelect();

	};

	return (
		<div className="search-item-anim">
			<CommandItem
				onSelect={onSelect || handleClick}
				className="flex items-center gap-4 p-2.5 rounded-xl cursor-pointer transition-all aria-selected:bg-white/10 group mx-1 mb-1 outline-none"
			>
				<div className="h-12 w-9 rounded-md bg-white/5 border border-white/10 overflow-hidden relative shadow-2xl flex-shrink-0">
					{item.poster_path ? (
						<img
							src={tmdbImage(item.poster_path, 'w92')}
							className="h-full w-full object-cover"
							alt={item.title || item.name || 'Poster'}
						/>
					) : (
						<div className="h-full w-full flex items-center justify-center opacity-10">
							<Film className="w-4 h-4" />
						</div>
					)}
				</div>
				<div className="flex flex-col flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<span className="text-sm font-semibold text-white/80 group-aria-selected:text-white truncate">
							{item.title || item.name}
						</span>
						{isRecent && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									onRemove();
								}}
								className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all z-10"
								aria-label="Remove from recent searches"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>
					<div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-white/20">
						<span>{item.media_type?.toUpperCase() || 'INFO'}</span>
						<span className="w-0.5 h-0.5 rounded-full bg-white/10" />
						<span>{year || 'N/A'}</span>
						{item.vote_average > 0 && (
							<div className="flex items-center gap-1 text-yellow-500/40 ml-auto">
								<Star className="w-2.5 h-2.5 fill-current" />
								<span>{item.vote_average.toFixed(1)}</span>
							</div>
						)}
					</div>
				</div>
				<ChevronRight className="w-4 h-4 text-white/20 group-aria-selected:text-white/40 transition-colors flex-shrink-0 ml-2" />
			</CommandItem>
		</div>
	);
}
