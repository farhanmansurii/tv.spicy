'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { MagnifyingGlassIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';

import Container from '@/components/shared/containers/container';
import MediaCard from '@/components/features/media/card/media-card';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { fetchRowDataFromApi, searchTMDBFromApi } from '@/lib/api/tmdb-row-client';
import { tmdbImage } from '@/lib/tmdb-image';
import useSearchStore from '@/store/recentsSearchStore';
import { cn } from '@/lib/utils';
import type { Show } from '@/lib/types';

/* ------------------------------------------------------------------ */
//  Constants
/* ------------------------------------------------------------------ */

const FILTERS = [
	{ id: 'all' as const, label: 'Everything' },
	{ id: 'movie' as const, label: 'Movies' },
	{ id: 'tv' as const, label: 'TV Shows' },
] as const;

type FilterType = (typeof FILTERS)[number]['id'];

/* ------------------------------------------------------------------ */
//  Filter tabs — flat underline style, no icons
/* ------------------------------------------------------------------ */

function FilterTabs({
	active,
	onChange,
}: {
	active: FilterType;
	onChange: (f: FilterType) => void;
}) {
	return (
		<div className="overflow-x-auto scrollbar-none">
			<div className="flex min-w-max gap-6 border-b border-white/[0.06]">
				{FILTERS.map((f) => {
					const isActive = active === f.id;
					return (
						<button
							key={f.id}
							onClick={() => onChange(f.id)}
							className={cn(
								'relative pb-3 text-[13px] font-semibold transition-colors duration-200',
								isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
							)}
						>
							{f.label}
							{isActive && (
								<motion.div
									layoutId="searchFilterIndicator"
									className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
									transition={{ type: 'spring', stiffness: 400, damping: 30 }}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Recent searches — horizontal poster cards
/* ------------------------------------------------------------------ */

function RecentSearches({
	items,
	onSelect,
	onRemove,
	onClear,
}: {
	items: Show[];
	onSelect: (item: Show) => void;
	onRemove: (id: number) => void;
	onClear: () => void;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-[15px] font-semibold text-white/70 tracking-tight">
					Recent Searches
				</h2>
				<button
					onClick={onClear}
					className="text-[11px] font-medium text-white/25 hover:text-white/60 transition-colors"
				>
					Clear all
				</button>
			</div>
			<div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
				{items.map((item) => (
					<div key={item.id} className="relative group shrink-0 w-[100px]">
						<button onClick={() => onSelect(item)} className="block w-full text-left">
							<div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/[0.04] mb-2">
								{item.poster_path ? (
									<img
										src={tmdbImage(item.poster_path, 'w185')}
										alt=""
										className="w-full h-full object-cover"
										loading="lazy"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<span className="text-[10px] text-white/15">No image</span>
									</div>
								)}
							</div>
							<p className="text-[12px] font-medium text-white/70 truncate leading-tight">
								{item.title || item.name}
							</p>
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onRemove(item.id);
							}}
							className={cn(
								'absolute -top-1.5 -right-1.5',
								'w-6 h-6 rounded-full',
								'bg-[#1c1c1e] border border-white/[0.08]',
								'flex items-center justify-center',
								'text-white/30 hover:text-white/70',
								'opacity-0 group-hover:opacity-100',
								'transition-all duration-200'
							)}
						>
							<XIcon className="w-3 h-3" weight="bold" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Trending grid — empty state content
/* ------------------------------------------------------------------ */

function TrendingGrid({ items, onSelect }: { items: Show[]; onSelect: (item: Show) => void }) {
	return (
		<div className="space-y-4">
			<h2 className="text-[15px] font-semibold text-white/70 tracking-tight">Trending Now</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
				{items.map((show, index) => (
					<MediaCard
						key={show.id}
						show={show}
						index={index}
						type={show.media_type === 'movie' ? 'movie' : 'tv'}
						isVertical={true}
						onClick={() => onSelect(show)}
					/>
				))}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Empty results state
/* ------------------------------------------------------------------ */

function EmptyResults({ query }: { query: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
				<MagnifyingGlassIcon className="w-6 h-6 text-white/20" />
			</div>
			<p className="text-base font-semibold text-white/80 mb-1">
				No results for &ldquo;{query}&rdquo;
			</p>
			<p className="text-sm text-white/30 max-w-xs leading-relaxed">
				Try a different search term or check your spelling.
			</p>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Pagination
/* ------------------------------------------------------------------ */

function Pagination({
	page,
	totalPages,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	onPageChange: (p: number) => void;
}) {
	if (totalPages <= 1) return null;
	return (
		<div className="flex justify-center items-center gap-5 pt-10">
			<button
				onClick={() => onPageChange(page - 1)}
				disabled={page === 1}
				className={cn(
					'flex items-center justify-center w-10 h-10 rounded-full',
					'bg-white/[0.04] border border-white/[0.08]',
					'text-white/50 hover:text-white hover:bg-white/[0.06]',
					'transition-all duration-200',
					'disabled:opacity-30 disabled:pointer-events-none'
				)}
			>
				<ArrowLeftIcon className="w-4 h-4" />
			</button>
			<span className="text-xs font-medium text-white/30 tabular-nums">
				Page {page} of {totalPages}
			</span>
			<button
				onClick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
				className={cn(
					'flex items-center justify-center w-10 h-10 rounded-full',
					'bg-white/[0.04] border border-white/[0.08]',
					'text-white/50 hover:text-white hover:bg-white/[0.06]',
					'transition-all duration-200',
					'disabled:opacity-30 disabled:pointer-events-none'
				)}
			>
				<ArrowRightIcon className="w-4 h-4" />
			</button>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Main search page
/* ------------------------------------------------------------------ */

export default function SearchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const defaultQuery = searchParams.get('q') || '';

	const [inputValue, setInputValue] = useState(defaultQuery);
	const [query, setQuery] = useState(defaultQuery);
	const [filter, setFilter] = useState<FilterType>('all');
	const [page, setPage] = useState(1);
	const [scrolled, setScrolled] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		recentlySearched,
		addToRecentlySearched,
		removeFromRecentlySearched,
		clearRecentlySearched,
	} = useSearchStore();

	// Auto-focus on mount
	useEffect(() => {
		const timer = setTimeout(() => inputRef.current?.focus(), 100);
		return () => clearTimeout(timer);
	}, []);

	// Track scroll for sticky bar background
	useEffect(() => {
		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setScrolled(window.scrollY > 8);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Debounce query
	useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(inputValue.trim());
			setPage(1);
		}, 400);
		return () => clearTimeout(timer);
	}, [inputValue]);

	// Search query
	const { data: searchData, isFetching } = useQuery({
		queryKey: ['search', query, page],
		queryFn: () => searchTMDBFromApi(query, page),
		enabled: query.length >= 2,
		placeholderData: (prev) => prev,
	});

	// Trending for empty state
	const { data: trendingData } = useQuery({
		queryKey: ['trending', 'all', 'week'],
		queryFn: () => fetchRowDataFromApi('trending/all/week'),
	});

	const results = useMemo(() => {
		const raw = ((searchData?.results || []) as Show[]).filter(Boolean);
		if (filter === 'all') return raw;
		return raw.filter((item) => item.media_type === filter);
	}, [searchData, filter]);

	// Apply filter to trending too
	const trending = useMemo(() => {
		const raw = ((trendingData || []) as Show[]).filter(Boolean);
		if (filter === 'all') return raw.slice(0, 12);
		return raw.filter((item) => item.media_type === filter).slice(0, 12);
	}, [trendingData, filter]);

	const totalPages = searchData?.total_pages || 1;

	const handleSelectShow = useCallback(
		(item: Show) => {
			addToRecentlySearched(item);
			// Navigation is handled by MediaCard's internal Link
		},
		[addToRecentlySearched]
	);

	const hasQuery = query.length >= 2;
	const showRecents = !hasQuery && recentlySearched.length > 0;
	const showTrending = !hasQuery && recentlySearched.length === 0;
	const showResults = hasQuery && results.length > 0;
	const showEmpty = hasQuery && results.length === 0 && !isFetching;
	const showLoader = hasQuery && isFetching && results.length === 0;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div
				className={cn(
					'sticky z-40 transition-all duration-300',
					'top-0 lg:top-14',
					'pt-16 lg:pt-0',
					'bg-background lg:bg-transparent',
					scrolled &&
						'lg:bg-black/80 lg:backdrop-blur-xl lg:border-b lg:border-white/[0.06]'
				)}
			>
				<Container className="pt-2 pb-0">
					<div className="relative">
						<div
							className={cn(
								'flex items-center h-12 px-4 gap-3 rounded-xl',
								'bg-white/[0.04] border border-white/[0.08]',
								'focus-within:border-[#0A84FF]/40 focus-within:ring-1 focus-within:ring-[#0A84FF]/20',
								'transition-all duration-200'
							)}
						>
							<MagnifyingGlassIcon className="w-5 h-5 text-white/25 shrink-0" />
							<input
								ref={inputRef}
								type="text"
								placeholder="Search movies, TV shows..."
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								className="flex-1 min-w-0 bg-transparent text-[15px] text-white/90 placeholder:text-white/20 outline-none h-full"
							/>
							{inputValue && (
								<button
									onClick={() => setInputValue('')}
									className="p-1.5 rounded-full text-white/25 hover:bg-white/[0.08] hover:text-white/60 transition-colors shrink-0"
								>
									<XIcon className="w-4 h-4" weight="bold" />
								</button>
							)}
							<kbd className="pointer-events-none hidden lg:flex h-5 items-center gap-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] px-1.5 font-mono text-[10px] font-medium text-white/20">
								<span className="text-[11px]">⌘</span>K
							</kbd>
						</div>
					</div>

					<div className="mt-8">
						<FilterTabs active={filter} onChange={setFilter} />
					</div>
				</Container>
			</div>

			<Container className="pb-20 pt-10 md:pt-3">
				{/* Recent searches */}
				{showRecents && (
					<div className="mb-6">
						<RecentSearches
							items={recentlySearched}
							onSelect={(item) => {
								const type = item.media_type || 'movie';
								router.push(`/${type}/${item.id}`);
								addToRecentlySearched(item);
							}}
							onRemove={removeFromRecentlySearched}
							onClear={clearRecentlySearched}
						/>
					</div>
				)}

				{/* Trending — empty state */}
				{showTrending && (
					<div className="mb-6">
						<TrendingGrid items={trending} onSelect={handleSelectShow} />
					</div>
				)}

				{/* Loader */}
				{showLoader && (
					<div className="py-20">
						<MediaLoader layout="grid" isVertical />
					</div>
				)}

				{/* Results */}
				{showResults && (
					<div className="space-y-6">
						{query && (
							<p className="text-sm text-white/30">
								{results.length > 0 && (
									<>
										<span className="text-white/60 font-semibold">
											{results.length}
										</span>{' '}
										results for{' '}
										<span className="text-white/60 font-semibold">
											&ldquo;{query}&rdquo;
										</span>
									</>
								)}
							</p>
						)}
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
							{results.map((show, index) => (
								<MediaCard
									key={show.id}
									show={show}
									index={index}
									type={show.media_type === 'movie' ? 'movie' : 'tv'}
									isVertical={true}
									onClick={() => handleSelectShow(show)}
								/>
							))}
						</div>
						<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				)}

				{/* Empty search results */}
				{showEmpty && <EmptyResults query={query} />}
			</Container>
		</div>
	);
}
