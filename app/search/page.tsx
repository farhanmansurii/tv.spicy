'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { MagnifyingGlassIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';

import Container from '@/components/shared/containers/container';
import MediaCard from '@/components/features/media/card/media-card';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { fetchRowDataFromApi, searchTMDBFromApi } from '@/lib/api/tmdb-row-client';
import { tmdbImage } from '@/lib/tmdb-image';
import useSearchStore from '@/store/recentsSearchStore';
import { useHasMounted } from '@/hooks/use-has-mounted';
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

// The same rhythm the editorial rows use for their poster grids.
const GRID =
	'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6';

// House press treatment: 150ms dip, colour on the same clock.
const pressableControl =
	'transition-[color,background-color,border-color,transform,scale] duration-(--duration-press) ease-out active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100';

const focusRing =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/* ------------------------------------------------------------------ */
//  Section heading — the page recipe: mono index, Anton title, mono count
/* ------------------------------------------------------------------ */

function SectionHeading({
	index,
	title,
	count,
	action,
}: {
	index: string;
	title: string;
	count?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="mb-3.5 flex items-end gap-3">
			<span
				aria-hidden="true"
				className="pb-1.25 font-mono text-caption leading-none tracking-label text-brand tabular-nums"
			>
				{index}
			</span>
			<h2 className="font-display text-display-row uppercase text-foreground">{title}</h2>
			{count && (
				<span className="hidden pb-1.25 font-mono text-caption leading-none tracking-meta-wide text-muted-foreground uppercase tabular-nums sm:block">
					{count}
				</span>
			)}
			{action && <div className="ml-auto flex shrink-0 items-center gap-3">{action}</div>}
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Filter tabs — own row, one marker element moved with transform only
/* ------------------------------------------------------------------ */

function FilterTabs({ active, onChange }: { active: FilterType; onChange: (f: FilterType) => void }) {
	const rowRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<Partial<Record<FilterType, HTMLButtonElement | null>>>({});
	const [marker, setMarker] = useState<{ x: number; scale: number } | null>(null);

	const measure = useCallback(() => {
		const row = rowRef.current;
		const tab = tabRefs.current[active];
		if (!row || !tab) return;
		const rowBox = row.getBoundingClientRect();
		const tabBox = tab.getBoundingClientRect();
		if (!rowBox.width) return;
		setMarker({ x: tabBox.x - rowBox.x, scale: tabBox.width / rowBox.width });
	}, [active]);

	useEffect(measure, [measure]);

	useEffect(() => {
		const row = rowRef.current;
		if (!row) return;
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => observer.disconnect();
	}, [measure]);

	return (
		<div className="overflow-x-auto">
			<div ref={rowRef} className="relative flex min-w-max gap-6 border-b border-border">
				{FILTERS.map((f) => {
					const isActive = active === f.id;
					return (
						<button
							key={f.id}
							ref={(el) => {
								tabRefs.current[f.id] = el;
							}}
							type="button"
							aria-pressed={isActive}
							onClick={() => onChange(f.id)}
							className={cn(
								'relative min-h-11 px-1 pb-3 font-mono text-caption font-medium uppercase',
								pressableControl,
								focusRing,
								isActive ? 'text-foreground' : 'text-muted-foreground can-hover:text-foreground'
							)}
						>
							{f.label}
						</button>
					);
				})}
				<span
					aria-hidden="true"
					className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-brand translate-x-(--marker-x) scale-x-(--marker-scale) transition-transform duration-(--duration-ui) ease-cinematic will-change-transform motion-reduce:transition-none motion-reduce:will-change-auto"
					style={
						{
							'--marker-x': `${marker?.x ?? 0}px`,
							'--marker-scale': marker?.scale ?? 0,
						} as React.CSSProperties
					}
				/>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Recent searches — poster cards in the media recipe
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
		<div className="flex flex-col">
			<SectionHeading
				index="01"
				title="Recent Searches"
				count={`${items.length} ${items.length === 1 ? 'title' : 'titles'}`}
				action={
					<button
						type="button"
						onClick={onClear}
						className={cn(
							'min-h-11 px-1 font-mono text-caption uppercase tracking-label text-muted-foreground can-hover:text-foreground',
							pressableControl,
							focusRing
						)}
					>
						Clear all
					</button>
				}
			/>
			<div className="flex gap-3 overflow-x-auto pb-2">
				{items.map((item) => {
					const title = item.title || item.name || 'Untitled';
					return (
						<div key={item.id} className="group relative w-25 shrink-0">
							<button
								type="button"
								onClick={() => onSelect(item)}
								className={cn(
									'pressable block w-full rounded-sm text-left',
									focusRing
								)}
							>
								<span
									aria-hidden="true"
									className="relative block aspect-2/3 w-full overflow-hidden rounded-sm bg-gradient-card-placeholder shadow-inset-line"
								>
									{item.poster_path ? (
										<img
											src={tmdbImage(item.poster_path, 'w185')}
											alt=""
											loading="lazy"
											decoding="async"
											className="size-full object-cover"
										/>
									) : (
										<span className="flex size-full items-center justify-center p-2 text-center font-mono text-micro uppercase leading-tight text-muted-foreground">
											{title}
										</span>
									)}
								</span>
								<span className="mt-2 block truncate text-title font-semibold text-foreground">
									{title}
								</span>
							</button>
							<button
								aria-label={`Remove ${title} from recent searches`}
								onClick={(e) => {
									e.stopPropagation();
									onRemove(item.id);
								}}
								className={cn(
									'absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full',
									'border border-border bg-muted text-muted-foreground',
									'pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100 can-hover:text-foreground can-hover:border-border-strong',
									pressableControl,
									focusRing
								)}
							>
								<XIcon className="size-3" weight="bold" />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
//  Poster grid — trending, shared by the empty state
/* ------------------------------------------------------------------ */

function TrendingGrid({ items, onSelect }: { items: Show[]; onSelect: (item: Show) => void }) {
	if (items.length === 0) return null;
	return (
		<div className="flex flex-col">
			<SectionHeading index="01" title="Trending Now" count={`${items.length} titles`} />
			<div className={GRID}>
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
//  Editorial states — the voice of the 404, left aligned, no decoration
/* ------------------------------------------------------------------ */

function EditorialState({
	kicker,
	title,
	body,
	action,
	role,
}: {
	kicker: string;
	title: string;
	body: string;
	action: { label: string; onClick: () => void };
	role?: 'alert';
}) {
	return (
		<div className="border-t border-border pt-10 pb-16" role={role}>
			<div className="max-w-prose">
				<p className="font-mono text-caption uppercase tracking-label text-dim">{kicker}</p>
				<h2 className="mt-4 font-display text-display-2 uppercase text-foreground">{title}</h2>
				<p className="mt-4 max-w-prose text-lede text-soft">{body}</p>
				<button
					type="button"
					onClick={action.onClick}
					className={cn(
						'pressable mt-8 inline-flex h-12 items-center justify-center rounded-full border border-border-strong bg-card px-5 text-body font-semibold text-foreground can-hover:border-foreground/25 can-hover:bg-muted',
						focusRing
					)}
				>
					{action.label}
				</button>
			</div>
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
		<div className="flex items-center justify-center gap-5 pt-10">
			<button
				aria-label="Previous page"
				onClick={() => onPageChange(page - 1)}
				disabled={page === 1}
				className={cn(
					'flex size-11 items-center justify-center rounded-full',
					'border border-border-strong bg-card text-muted-foreground can-hover:bg-muted can-hover:text-foreground',
					pressableControl,
					focusRing,
					'disabled:pointer-events-none disabled:opacity-30'
				)}
			>
				<ArrowLeftIcon className="size-4" />
			</button>
			<span className="font-mono text-caption tracking-label text-muted-foreground uppercase tabular-nums">
				Page <span className="text-foreground">{page}</span> of {totalPages}
			</span>
			<button
				aria-label="Next page"
				onClick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
				className={cn(
					'flex size-11 items-center justify-center rounded-full',
					'border border-border-strong bg-card text-muted-foreground can-hover:bg-muted can-hover:text-foreground',
					pressableControl,
					focusRing,
					'disabled:pointer-events-none disabled:opacity-30'
				)}
			>
				<ArrowRightIcon className="size-4" />
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
	const urlQuery = searchParams.get('query') || searchParams.get('q') || '';

	const [inputValue, setInputValue] = useState(urlQuery);
	const [query, setQuery] = useState(urlQuery);
	const [filter, setFilter] = useState<FilterType>('all');
	const [page, setPage] = useState(1);
	const [scrolled, setScrolled] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const isMounted = useHasMounted();

	const {
		recentlySearched,
		addToRecentlySearched,
		removeFromRecentlySearched,
		clearRecentlySearched,
	} = useSearchStore();

	// A shared link, the header search or back/forward can change the query
	// while this page stays mounted, so the field follows the URL.
	useEffect(() => {
		setInputValue(urlQuery);
		setQuery(urlQuery.trim());
		setPage(1);
	}, [urlQuery]);

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
	const { data: searchData, isFetching, isError, refetch } = useQuery({
		queryKey: ['search', query, page],
		queryFn: () => searchTMDBFromApi(query, page),
		enabled: query.length >= 2,
		placeholderData: (prev) => prev,
	});

	// Trending for empty state
	const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
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
		},
		[addToRecentlySearched]
	);

	const hasQuery = query.length >= 2;
	const hasRecents = isMounted && recentlySearched.length > 0;
	const showRecents = !hasQuery && hasRecents;
	const showTrending = !hasQuery && !hasRecents;
	const showEmpty = hasQuery && results.length === 0 && !isFetching && !isError;
	const showLoader = hasQuery && isFetching && results.length === 0;

	const clearSearch = useCallback(() => {
		setInputValue('');
		setQuery('');
		setPage(1);
		inputRef.current?.focus();
	}, []);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div
				className={cn(
					'sticky z-40 transition-[background-color,border-color] duration-(--duration-ui) motion-reduce:transition-none',
					'top-0 mt-16 lg:top-16',
					'bg-background lg:bg-transparent',
					scrolled && 'lg:border-b lg:border-border lg:bg-background'
				)}
			>
				<Container className="pt-2 pb-0">
					<div className="flex h-12 items-center gap-3 rounded-sm border border-border-strong bg-card px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-background">
						<MagnifyingGlassIcon className="size-5 shrink-0 text-muted-foreground" />
						<input
							ref={inputRef}
							aria-label="Search movies and TV shows"
							type="text"
							autoComplete="off"
							spellCheck={false}
							placeholder="Search movies, TV shows..."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
						/>
						{inputValue && (
							<button
								aria-label="Clear search"
								onClick={clearSearch}
								className={cn(
									'flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground can-hover:bg-foreground/[0.08] can-hover:text-foreground',
									pressableControl,
									focusRing
								)}
							>
								<XIcon className="size-4" weight="bold" />
							</button>
						)}
						<kbd className="pointer-events-none hidden h-6 items-center gap-1 rounded-sm border border-border bg-muted px-1.5 font-mono text-micro font-medium tracking-label text-dim lg:flex">
							<span aria-hidden="true">⌘</span>K
						</kbd>
					</div>

					<div className="mt-6">
						<FilterTabs active={filter} onChange={setFilter} />
					</div>
				</Container>
			</div>

			<Container className="section-spacing">
				{showRecents && (
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
				)}

				{showTrending &&
					(trending.length > 0 ? (
						<TrendingGrid items={trending} onSelect={handleSelectShow} />
					) : isTrendingLoading ? (
						<div className="flex flex-col">
							<SectionHeading index="01" title="Trending Now" />
							<MediaLoader layout="grid" isVertical className="py-0" />
						</div>
					) : null)}

				{/* The heading stays put while the grid swaps, so nothing jumps */}
				{hasQuery && !isError && (results.length > 0 || isFetching) && (
					<div className="flex flex-col">
						<p className="mb-2 truncate font-mono text-caption uppercase tracking-label text-dim">
							&ldquo;{query}&rdquo;
						</p>
						<SectionHeading
							index="01"
							title="Results"
							count={results.length > 0 ? `${results.length} titles` : undefined}
						/>
						{showLoader ? (
							<MediaLoader layout="grid" isVertical className="py-0" />
						) : (
							<>
								<div className={GRID}>
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
							</>
						)}
						{isFetching && results.length > 0 && (
							<p aria-live="polite" className="sr-only">
								Loading page {page}
							</p>
						)}
					</div>
				)}

				{hasQuery && isError && (
					<EditorialState
						role="alert"
						kicker="Search failed"
						title="The projector jammed."
						body="The archive did not answer. Try again, or search a shorter term."
						action={{ label: 'Try again', onClick: () => void refetch() }}
					/>
				)}

				{showEmpty && (
					<EditorialState
						kicker={`No results for “${query}”`}
						title="The reel came up empty."
						body="Nothing in the archive matches that. Try a shorter term, or check the spelling."
						action={{ label: 'Clear search', onClick: clearSearch }}
					/>
				)}
			</Container>
		</div>
	);
}
