'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchTMDB, fetchGenres, discoverMedia } from '@/lib/searchUtils';
import { fetchRowData } from '@/lib/utils';

import Container from '@/components/shared/containers/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Loader2,
	Search,
	X,
	Grid3x3,
	List,
	SlidersHorizontal,
	ArrowUpDown,
	Filter,
	Film,
	Tv,
	LayoutGrid,
} from 'lucide-react';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import MediaCard from '@/components/features/media/card/media-card';
import CommonTitle from '@/components/shared/animated/common-title';
import { Show } from '@/lib/types';
import { cn } from '@/lib/utils';
import GridLoader from '@/components/shared/loaders/grid-loader';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'grid' | 'list';
type SortOption =
	| 'popularity.desc'
	| 'vote_average.desc'
	| 'release_date.desc'
	| 'first_air_date.desc';

export default function SearchPageClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const defaultQuery = searchParams.get('q') || '';

	const [inputValue, setInputValue] = useState(defaultQuery);
	const [query, setQuery] = useState(defaultQuery);
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [showFilters, setShowFilters] = useState(false);
	const [page, setPage] = useState(1);

	// Filters
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedYear, setSelectedYear] = useState<string | undefined>();
	const [minRating, setMinRating] = useState<number>(0);
	const [language, setLanguage] = useState<string | undefined>();
	const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
	const [sortBy, setSortBy] = useState<SortOption>('popularity.desc');

	// Fetch genres
	const { data: genreData } = useQuery({
		queryKey: ['genres', mediaType],
		queryFn: () => fetchGenres(mediaType === 'tv' ? 'tv' : 'movie'),
		staleTime: 1000 * 60 * 60 * 24,
	});

	// Search query
	const {
		data: searchResults,
		isFetching,
		error,
	} = useQuery({
		queryKey: ['search', query, page],
		queryFn: () => searchTMDB(query, page),
		enabled: query.trim().length >= 2,
		staleTime: 1000 * 60 * 5,
	});

	// Discover API for advanced filtering
	const { data: discoverResults, isFetching: isDiscovering } = useQuery({
		queryKey: [
			'discover',
			mediaType,
			selectedGenres,
			selectedYear,
			minRating,
			language,
			sortBy,
			page,
		],
		queryFn: () =>
			discoverMedia({
				type: mediaType === 'all' ? undefined : mediaType,
				genres: selectedGenres,
				year: selectedYear,
				minRating,
				language,
				sortBy,
				page,
			}),
		enabled:
			query.trim().length < 2 &&
			(selectedGenres.length > 0 || !!selectedYear || minRating > 0 || !!language),
		staleTime: 1000 * 60 * 5,
	});

	// Trending suggestions when no query
	const { data: trendingMovies } = useQuery({
		queryKey: ['trending-movies'],
		queryFn: () => fetchRowData('trending/movie/week'),
		enabled: !query && !showFilters,
		staleTime: 1000 * 60 * 60,
	});

	const { data: trendingTV } = useQuery({
		queryKey: ['trending-tv'],
		queryFn: () => fetchRowData('trending/tv/week'),
		enabled: !query && !showFilters,
		staleTime: 1000 * 60 * 60,
	});

	// Debounce effect
	useEffect(() => {
		const trimmed = inputValue.trim();
		if (trimmed.length < 2) {
			setQuery('');
			setPage(1);
			return;
		}

		const debounce = setTimeout(() => {
			setQuery(trimmed);
			setPage(1);
			router.push(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
		}, 400);

		return () => clearTimeout(debounce);
	}, [inputValue, router]);

	// Update URL when query changes
	useEffect(() => {
		if (query) {
			router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
		}
	}, [query, router]);

	const resetFilters = () => {
		setSelectedGenres([]);
		setSelectedYear(undefined);
		setMinRating(0);
		setLanguage(undefined);
		setMediaType('all');
		setSortBy('popularity.desc');
		setPage(1);
	};

	const resetSearch = () => {
		setInputValue('');
		setQuery('');
		setPage(1);
		router.push('/search', { scroll: false });
	};

	const handleGenreToggle = (id: number) => {
		setSelectedGenres((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
		setPage(1);
	};

	// Determine which results to show
	const results = useMemo(() => {
		if (query.trim().length >= 2) {
			return searchResults?.results || [];
		}
		if (selectedGenres.length > 0 || selectedYear || minRating > 0 || language) {
			return discoverResults?.results || [];
		}
		return [];
	}, [query, searchResults, discoverResults, selectedGenres, selectedYear, minRating, language]);

	// Filter results by media type
	const filteredResults = useMemo(() => {
		if (mediaType === 'all') return results;
		return results.filter((item: any) => item.media_type === mediaType);
	}, [results, mediaType]);

	// Sort results
	const sortedResults = useMemo(() => {
		if (!query && sortBy) {
			// Already sorted by discover API
			return filteredResults;
		}

		return [...filteredResults].sort((a: any, b: any) => {
			switch (sortBy) {
				case 'vote_average.desc':
					return (b.vote_average || 0) - (a.vote_average || 0);
				case 'release_date.desc':
					const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
					const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
					return dateB - dateA;
				case 'first_air_date.desc':
					const airDateA = new Date(a.first_air_date || 0).getTime();
					const airDateB = new Date(b.first_air_date || 0).getTime();
					return airDateB - airDateA;
				default:
					return (b.popularity || 0) - (a.popularity || 0);
			}
		});
	}, [filteredResults, sortBy, query]);

	const totalPages = query ? searchResults?.total_pages || 1 : discoverResults?.total_pages || 1;

	const isLoading = isFetching || isDiscovering;
	const hasActiveFilters = selectedGenres.length > 0 || selectedYear || minRating > 0 || language;

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-8 md:py-12 space-y-8">
				{/* Header & Search Hero */}
				<div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto w-full">
					<CommonTitle
						text="Search & Discover"
						className="text-3xl md:text-5xl text-center"
					/>

					{/* Spotlight Search Bar */}
					<div className="relative w-full group z-10">
						<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
						<div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl md:rounded-full overflow-hidden shadow-xl backdrop-blur-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-white/10">
							<Search className="absolute left-4 md:left-6 w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
							<Input
								placeholder="What are you looking for?"
								className="w-full h-14 md:h-16 pl-12 md:pl-16 pr-14 text-lg md:text-xl bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
							/>
							{inputValue && (
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-2 md:right-3 h-10 w-10 hover:bg-white/10 rounded-full"
									onClick={resetSearch}
								>
									<X className="w-5 h-5 text-muted-foreground" />
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Controls Bar */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-30 bg-background/80 backdrop-blur-xl p-4 rounded-xl border border-border/50 shadow-sm mt-8">
					{/* Left: Type Toggles */}
					<div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
						<Button
							variant={mediaType === 'all' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => {
								setMediaType('all');
								setPage(1);
							}}
							className="h-8 rounded-md px-4 text-sm font-medium transition-all"
						>
							All
						</Button>
						<Button
							variant={mediaType === 'movie' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => {
								setMediaType('movie');
								setPage(1);
							}}
							className="h-8 rounded-md px-4 text-sm font-medium transition-all gap-2"
						>
							<Film className="w-4 h-4" /> Movies
						</Button>
						<Button
							variant={mediaType === 'tv' ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => {
								setMediaType('tv');
								setPage(1);
							}}
							className="h-8 rounded-md px-4 text-sm font-medium transition-all gap-2"
						>
							<Tv className="w-4 h-4" /> TV
						</Button>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
						<Select
							value={sortBy}
							onValueChange={(val) => setSortBy(val as SortOption)}
						>
							<SelectTrigger className="w-[160px] h-9 bg-background/50 border-border/50">
								<ArrowUpDown className="w-4 h-4 mr-2 opacity-50" />
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="popularity.desc">Popularity</SelectItem>
								<SelectItem value="vote_average.desc">Rating</SelectItem>
								<SelectItem value="release_date.desc">Release Date</SelectItem>
							</SelectContent>
						</Select>

						<Button
							variant={showFilters ? 'secondary' : 'outline'}
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
							className={cn(
								'h-9 border-border/50 bg-background/50 gap-2',
								hasActiveFilters && 'border-primary/50 text-primary'
							)}
						>
							<Filter className="w-4 h-4" />
							Filters
							{hasActiveFilters && (
								<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							)}
						</Button>

						<div className="h-6 w-px bg-border/50 mx-1 hidden md:block" />

						<div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
							<Button
								variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
								size="icon"
								className="h-7 w-7 rounded-md"
								onClick={() => setViewMode('grid')}
							>
								<LayoutGrid className="w-4 h-4" />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'secondary' : 'ghost'}
								size="icon"
								className="h-7 w-7 rounded-md"
								onClick={() => setViewMode('list')}
							>
								<List className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Collapsible Filters Panel */}
				<div
					className={cn(
						'grid grid-rows-[0fr] transition-all duration-300 ease-in-out',
						showFilters
							? 'grid-rows-[1fr] opacity-100 mb-6'
							: 'grid-rows-[0fr] opacity-0'
					)}
				>
					<div className="overflow-hidden">
						<div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-6 backdrop-blur-sm">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Selectors */}
								<div className="space-y-4">
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Refine By
									</label>
									<div className="grid grid-cols-2 gap-3">
										<Select
											value={selectedYear}
											onValueChange={setSelectedYear}
										>
											<SelectTrigger className="bg-background/50">
												<SelectValue placeholder="Year" />
											</SelectTrigger>
											<SelectContent className="max-h-[300px]">
												{Array.from({ length: 40 }, (_, i) => {
													const year = `${new Date().getFullYear() - i}`;
													return (
														<SelectItem key={year} value={year}>
															{year}
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>

										<Select value={language} onValueChange={setLanguage}>
											<SelectTrigger className="bg-background/50">
												<SelectValue placeholder="Language" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="en">English</SelectItem>
												<SelectItem value="ja">Japanese</SelectItem>
												<SelectItem value="ko">Korean</SelectItem>
												<SelectItem value="es">Spanish</SelectItem>
												<SelectItem value="fr">French</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Rating Slider */}
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											Min Rating
										</label>
										<span className="text-sm font-bold text-primary">
											{minRating.toFixed(1)}
										</span>
									</div>
									<input
										type="range"
										min="0"
										max="10"
										step="0.5"
										value={minRating}
										onChange={(e) => {
											setMinRating(parseFloat(e.target.value));
											setPage(1);
										}}
										className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
									/>
									<div className="flex justify-between text-xs text-muted-foreground px-1">
										<span>0</span>
										<span>5</span>
										<span>10</span>
									</div>
								</div>

								{/* Active Tags / Reset */}
								<div className="space-y-4 flex flex-col justify-between">
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Active Filters
									</label>
									<div className="flex flex-wrap gap-2 min-h-[40px]">
										{!hasActiveFilters && (
											<p className="text-sm text-muted-foreground italic">
												No filters active
											</p>
										)}

										{selectedYear && (
											<Badge
												variant="secondary"
												onClick={() => setSelectedYear(undefined)}
												className="hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors gap-1"
											>
												{selectedYear} <X className="w-3 h-3" />
											</Badge>
										)}
										{language && (
											<Badge
												variant="secondary"
												onClick={() => setLanguage(undefined)}
												className="hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors gap-1"
											>
												{language.toUpperCase()} <X className="w-3 h-3" />
											</Badge>
										)}
										{minRating > 0 && (
											<Badge
												variant="secondary"
												onClick={() => setMinRating(0)}
												className="hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors gap-1"
											>
												★ {minRating}+ <X className="w-3 h-3" />
											</Badge>
										)}
									</div>
									{hasActiveFilters && (
										<Button
											variant="ghost"
											size="sm"
											onClick={resetFilters}
											className="self-start text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
										>
											Reset All
										</Button>
									)}
								</div>
							</div>
							{genreData?.length > 0 && (
								<div className="space-y-3">
									<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Genres
									</label>
									<div className="flex flex-wrap gap-2">
										{genreData.map((genre: any) => {
											const isSelected = selectedGenres.includes(genre.id);
											return (
												<button
													key={genre.id}
													onClick={() => handleGenreToggle(genre.id)}
													className={cn(
														'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
														isSelected
															? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
															: 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
													)}
												>
													{genre.name}
												</button>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Content Area */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<div className="space-y-6">
							<div className="flex items-center gap-2">
								<Search className="w-4 h-4 text-primary" />
								<Skeleton className="h-4 w-48 bg-muted" />
							</div>
							<GridLoader />
						</div>
					) : error ? (
						<div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/10">
							<p className="text-destructive font-medium">Something went wrong.</p>
							<Button
								variant="outline"
								onClick={() => window.location.reload()}
								className="mt-4"
							>
								Try Again
							</Button>
						</div>
					) : query && sortedResults.length > 0 ? (
						<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="flex items-center gap-2">
								<Search className="w-4 h-4 text-primary" />
								<p className="text-sm font-medium text-muted-foreground">
									Found{' '}
									<span className="text-foreground font-bold">
										{searchResults?.total_results || sortedResults.length}
									</span>{' '}
									results for &quot;{query}&quot;
								</p>
							</div>
							<ResultsGrid results={sortedResults} viewMode={viewMode} />
							{totalPages > 1 && (
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							)}
						</div>
					) : query && sortedResults.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
							<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
								<Search className="w-8 h-8 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold">No results found</h3>
							<p className="text-muted-foreground max-w-md">
								We couldn&apos;t find anything matching &quot;{query}&quot;. Try
								checking for typos or use fewer keywords.
							</p>
							<Button variant="outline" onClick={resetFilters}>
								Clear Filters
							</Button>
						</div>
					) : !query && !showFilters ? (
						<div className="space-y-12 animate-in fade-in duration-700">
							{trendingMovies && trendingMovies.length > 0 && (
								<section>
									<div className="flex items-center gap-3 mb-6">
										<div className="w-1 h-6 bg-primary rounded-full" />
										<h2 className="text-2xl font-bold tracking-tight">
											Trending Movies
										</h2>
									</div>
									<ResultsGrid
										results={trendingMovies.slice(0, 10)}
										viewMode={viewMode}
									/>
								</section>
							)}
							{trendingTV && trendingTV.length > 0 && (
								<section>
									<div className="flex items-center gap-3 mb-6">
										<div className="w-1 h-6 bg-primary rounded-full" />
										<h2 className="text-2xl font-bold tracking-tight">
											Trending Series
										</h2>
									</div>
									<ResultsGrid
										results={trendingTV.slice(0, 10)}
										viewMode={viewMode}
									/>
								</section>
							)}
						</div>
					) : sortedResults.length > 0 ? (
						<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="flex items-center gap-2">
								<Filter className="w-4 h-4 text-primary" />
								<p className="text-sm font-medium text-muted-foreground">
									Found{' '}
									<span className="text-foreground font-bold">
										{discoverResults?.total_results || sortedResults.length}
									</span>{' '}
									titles matching your filters
								</p>
							</div>
							<ResultsGrid results={sortedResults} viewMode={viewMode} />
							{totalPages > 1 && (
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-32 space-y-4 text-center opacity-50">
							<LayoutGrid className="w-12 h-12 text-muted-foreground" />
							<p className="text-lg text-muted-foreground font-medium">
								Start typing to explore or use filters to browse.
							</p>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}

// Optimized Grid Component
function ResultsGrid({ results, viewMode }: { results: Show[]; viewMode: ViewMode }) {
	if (viewMode === 'list') {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{results.map((show, index) => (
					<div
						key={show.id}
						className="group flex gap-4 p-3 rounded-xl border border-transparent bg-muted/20 hover:bg-muted/40 hover:border-border/50 transition-all duration-300"
					>
						{/* Use MediaCard but constrain width for list view looks */}
						<div className="w-[100px] shrink-0 aspect-[2/3] rounded-lg overflow-hidden shadow-sm">
							<MediaCard
								show={show}
								index={index}
								type={show.media_type || 'tv'}
								isVertical={true}
							/>
						</div>
						<div className="flex flex-col justify-center py-2 space-y-2">
							<h4 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
								{show.title || show.name}
							</h4>
							<div className="flex items-center gap-3 text-xs text-muted-foreground">
								<Badge variant="outline" className="text-[10px] h-5 px-1.5">
									{show.media_type === 'movie' ? 'MOVIE' : 'TV'}
								</Badge>
								<span>
									{new Date(
										show.release_date || show.first_air_date || ''
									).getFullYear() || 'N/A'}
								</span>
								<span className="flex items-center gap-1">
									★ {(show.vote_average || 0).toFixed(1)}
								</span>
							</div>
							<p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
								{show.overview || 'No overview available.'}
							</p>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
			{results.map((show, index) => (
				<div
					key={show.id}
					className="transform transition-transform duration-300 hover:scale-[1.02] hover:z-10"
				>
					<MediaCard
						show={show}
						index={index}
						type={show.media_type || 'tv'}
						isVertical={true}
					/>
				</div>
			))}
		</div>
	);
}

function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	const pages = [];
	const maxVisible = 5;

	let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
	let end = Math.min(totalPages, start + maxVisible - 1);

	if (end - start < maxVisible - 1) {
		start = Math.max(1, end - maxVisible + 1);
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	return (
		<div className="flex items-center justify-center gap-2 py-12">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="h-8 w-24"
			>
				Previous
			</Button>
			<div className="hidden sm:flex gap-1">
				{pages.map((page) => (
					<Button
						key={page}
						variant={page === currentPage ? 'default' : 'ghost'}
						size="sm"
						onClick={() => onPageChange(page)}
						className={cn('h-8 w-8 p-0', page === currentPage && 'pointer-events-none')}
					>
						{page}
					</Button>
				))}
			</div>
			<span className="sm:hidden text-sm font-medium mx-2">
				Page {currentPage} / {totalPages}
			</span>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="h-8 w-24"
			>
				Next
			</Button>
		</div>
	);
}
