'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchTMDB, fetchGenres, discoverMedia } from '@/lib/searchUtils';
import { fetchRowData } from '@/lib/utils';

// UI Components
import Container from '@/components/shared/containers/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	X,
	List,
	SlidersHorizontal,
	ArrowUpDown,
	Filter,
	Film,
	Tv,
	LayoutGrid,
	Sparkles,
	ChevronLeft,
	ChevronRight,
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
import GridLoader from '@/components/shared/loaders/grid-loader';
import { Skeleton } from '@/components/ui/skeleton';

// Utils
import { Show } from '@/lib/types';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'first_air_date.desc';

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

	// --- Queries ---
	const { data: genreData } = useQuery({
		queryKey: ['genres', mediaType],
		queryFn: () => fetchGenres(mediaType === 'tv' ? 'tv' : 'movie'),
		staleTime: 1000 * 60 * 60 * 24,
	});

	const { data: searchResults, isFetching, error } = useQuery({
		queryKey: ['search', query, page],
		queryFn: () => searchTMDB(query, page),
		enabled: query.trim().length >= 2,
	});

	const { data: discoverResults, isFetching: isDiscovering } = useQuery({
		queryKey: ['discover', mediaType, selectedGenres, selectedYear, minRating, language, sortBy, page],
		queryFn: () => discoverMedia({ type: mediaType === 'all' ? undefined : mediaType, genres: selectedGenres, year: selectedYear, minRating, language, sortBy, page }),
		enabled: query.trim().length < 2 && (selectedGenres.length > 0 || !!selectedYear || minRating > 0 || !!language),
	});

	const { data: trendingMovies } = useQuery({
		queryKey: ['trending-movies'],
		queryFn: () => fetchRowData('trending/movie/week'),
		enabled: !query && !showFilters,
	});

	const { data: trendingTV } = useQuery({
		queryKey: ['trending-tv'],
		queryFn: () => fetchRowData('trending/tv/week'),
		enabled: !query && !showFilters,
	});

	// --- Effects & Logic ---
	useEffect(() => {
		const trimmed = inputValue.trim();
		if (trimmed.length < 2) {
			setQuery('');
			return;
		}
		const debounce = setTimeout(() => {
			setQuery(trimmed);
			setPage(1);
			router.push(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
		}, 400);
		return () => clearTimeout(debounce);
	}, [inputValue, router]);

	const resetSearch = () => {
		setInputValue('');
		setQuery('');
		setPage(1);
		router.push('/search', { scroll: false });
	};

	const results = useMemo(() => {
		if (query.trim().length >= 2) return searchResults?.results || [];
		if (selectedGenres.length > 0 || selectedYear || minRating > 0 || language) return discoverResults?.results || [];
		return [];
	}, [query, searchResults, discoverResults, selectedGenres, selectedYear, minRating, language]);

	const sortedResults = useMemo(() => {
		if (!query && sortBy) return results;
		return [...results].sort((a: any, b: any) => {
			if (sortBy === 'vote_average.desc') return (b.vote_average || 0) - (a.vote_average || 0);
			if (sortBy === 'release_date.desc') return new Date(b.release_date || b.first_air_date || 0).getTime() - new Date(a.release_date || a.first_air_date || 0).getTime();
			return (b.popularity || 0) - (a.popularity || 0);
		});
	}, [results, sortBy, query]);

	const totalPages = query ? searchResults?.total_pages || 1 : discoverResults?.total_pages || 1;
	const isLoading = isFetching || isDiscovering;
	const hasActiveFilters = selectedGenres.length > 0 || !!selectedYear || minRating > 0 || !!language;

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Ambient Background Glow */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
			</div>

			<Container className="relative py-12 space-y-12">
				{/* 1. Header & Spotlight Search */}
				<div className="flex flex-col items-center space-y-8 max-w-3xl mx-auto w-full">
					<div className="text-center space-y-4">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground animate-in fade-in slide-in-from-top-4">
							<Sparkles className="w-3 h-3 text-primary" />
							Discover your next favorite story
						</div>
						<h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Search Everything</h1>
					</div>

					<div className="relative w-full group">
						<div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl" />
						<div className="relative flex items-center bg-card border border-input rounded-2xl h-16 md:h-20 px-6 shadow-2xl transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
							<Search className="w-6 h-6 text-muted-foreground mr-4 shrink-0" />
							<Input
								placeholder="Search movies, TV shows, and more..."
								className="border-none bg-red-500 text-xl p-0 h-full focus-visible:ring-0 placeholder:text-muted-foreground/30"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
							/>
							{inputValue && (
								<Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary h-10 w-10 shrink-0" onClick={resetSearch}>
									<X className="w-5 h-5" />
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* 2. Floating Toolbar */}
				<div className="sticky top-6 z-40 flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-card/50 backdrop-blur-xl border border-border rounded-2xl shadow-xl">
					{/* Media Type Toggles (Segmented Control Pattern) */}
					<div className="flex items-center p-1 bg-muted rounded-xl w-full md:w-auto">
						{[
							{ id: 'all', label: 'All', icon: LayoutGrid },
							{ id: 'movie', label: 'Movies', icon: Film },
							{ id: 'tv', label: 'TV Shows', icon: Tv },
						].map((item) => (
							<button
								key={item.id}
								onClick={() => { setMediaType(item.id as any); setPage(1); }}
								className={cn(
									"flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all",
									mediaType === item.id ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
								)}
							>
								<item.icon className="w-4 h-4" />
								{item.label}
							</button>
						))}
					</div>

					{/* Right Side Controls */}
					<div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
						<Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
							<SelectTrigger className="w-[160px] h-10 bg-background border-border rounded-xl">
								<ArrowUpDown className="w-4 h-4 mr-2 opacity-50" />
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="popularity.desc">Trending</SelectItem>
								<SelectItem value="vote_average.desc">Rating</SelectItem>
								<SelectItem value="release_date.desc">Release Date</SelectItem>
							</SelectContent>
						</Select>

						<Button
							variant={showFilters ? 'secondary' : 'outline'}
							className={cn("h-10 rounded-xl gap-2 border-border bg-background", hasActiveFilters && "border-primary/50 text-primary")}
							onClick={() => setShowFilters(!showFilters)}
						>
							<SlidersHorizontal className="w-4 h-4" />
							Filters
							{hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
						</Button>

						<div className="h-6 w-px bg-border mx-1 hidden md:block" />

						<div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
							<Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setViewMode('grid')}>
								<LayoutGrid className="w-4 h-4" />
							</Button>
							<Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setViewMode('list')}>
								<List className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* 3. Collapsible Filter Content */}
				{showFilters && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card border border-border animate-in fade-in zoom-in-95 duration-300">
						<div className="space-y-3">
							<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Release Year</label>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger className="bg-background border-border"><SelectValue placeholder="All Years" /></SelectTrigger>
								<SelectContent className="max-h-[300px]">
									{Array.from({ length: 40 }, (_, i) => {
										const year = `${new Date().getFullYear() - i}`;
										return <SelectItem key={year} value={year}>{year}</SelectItem>;
									})}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Rating</label>
								<span className="text-sm font-bold text-primary">{minRating.toFixed(1)}</span>
							</div>
							<input type="range" min="0" max="10" step="0.5" value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))} className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
						</div>

						<div className="space-y-3">
							<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Language</label>
							<Select value={language} onValueChange={setLanguage}>
								<SelectTrigger className="bg-background border-border"><SelectValue placeholder="All Languages" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="ja">Japanese</SelectItem>
									<SelectItem value="ko">Korean</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-end">
							<Button variant="destructive" className="w-full rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => { setSelectedGenres([]); setMinRating(0); setSelectedYear(undefined); setLanguage(undefined); }}>
								Reset All
							</Button>
						</div>

						{genreData?.length > 0 && (
							<div className="md:col-span-4 pt-4 border-t border-border">
								<div className="flex flex-wrap gap-2">
									{genreData.map((genre: any) => (
										<Badge
											key={genre.id}
											onClick={() => setSelectedGenres(prev => prev.includes(genre.id) ? prev.filter(g => g !== genre.id) : [...prev, genre.id])}
											className={cn(
												"px-4 py-2 rounded-xl cursor-pointer transition-all border border-transparent",
												selectedGenres.includes(genre.id) ? "bg-primary text-white scale-105 shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"
											)}
										>
											{genre.name}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* 4. Results Area */}
				<div className="min-h-[400px]">
					{isLoading ? (
						<GridLoader />
					) : sortedResults.length > 0 ? (
						<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
							<div className="flex items-center justify-between border-b border-border pb-4">
								<h3 className="text-xl font-medium">
									{query ? `Search results for "${query}"` : 'Discovery Feed'}
								</h3>
								<p className="text-sm text-muted-foreground">{sortedResults.length} items found</p>
							</div>
							<ResultsGrid results={sortedResults} viewMode={viewMode} />
							{totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
						</div>
					) : !query && !showFilters ? (
						<div className="space-y-12 animate-in fade-in duration-1000">
							{trendingMovies && (
								<section className="space-y-6">
									<h2 className="text-2xl font-bold flex items-center gap-2 px-1"><Film className="w-5 h-5 text-primary"/> Trending Movies</h2>
									<ResultsGrid results={trendingMovies.slice(0, 6)} viewMode={viewMode} />
								</section>
							)}
							{trendingTV && (
								<section className="space-y-6">
									<h2 className="text-2xl font-bold flex items-center gap-2 px-1"><Tv className="w-5 h-5 text-primary"/> Trending Series</h2>
									<ResultsGrid results={trendingTV.slice(0, 6)} viewMode={viewMode} />
								</section>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
								<div className="relative h-20 w-20 rounded-3xl bg-card border border-border flex items-center justify-center shadow-xl">
									<Search className="w-8 h-8 text-muted-foreground" />
								</div>
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-bold tracking-tight">No matches found</h2>
								<p className="text-muted-foreground max-w-sm mx-auto">We couldn't find anything matching your search. Try adjusting your filters.</p>
							</div>
							<Button variant="secondary" className="rounded-xl px-8" onClick={resetSearch}>Clear Search</Button>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}

// Optimized Grid/List Components
function ResultsGrid({ results, viewMode }: { results: Show[]; viewMode: ViewMode }) {
	return (
		<div className={cn(
			"grid gap-6",
			viewMode === 'grid'
				? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				: "grid-cols-1 md:grid-cols-2"
		)}>
			{results.map((show, index) => (
				<div key={show.id} className={cn(
					"group transition-all duration-500 hover:-translate-y-2",
					viewMode === 'list' && "flex gap-4 p-4 rounded-2xl bg-card border border-border"
				)}>
					<div className={cn(viewMode === 'list' ? "w-[120px] shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-lg" : "")}>
						<MediaCard show={show} index={index} type={show.media_type || 'tv'} isVertical={true} />
					</div>
					{viewMode === 'list' && (
						<div className="flex flex-col justify-center space-y-3">
							<h4 className="text-xl font-bold line-clamp-1">{show.title || show.name}</h4>
							<div className="flex items-center gap-3">
								<Badge variant="outline" className="text-[10px]">{show.media_type?.toUpperCase()}</Badge>
								<span className="text-xs text-muted-foreground">{new Date(show.release_date || show.first_air_date || 0).getFullYear()}</span>
								<span className="text-xs font-bold text-primary flex items-center gap-1">★ {show.vote_average?.toFixed(1)}</span>
							</div>
							<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{show.overview}</p>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
	return (
		<div className="flex justify-center items-center gap-3 pt-12 border-t border-border mt-12">
			<Button variant="outline" className="rounded-xl border-border bg-card" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
				<ChevronLeft className="w-4 h-4 mr-2"/> Previous
			</Button>
			<div className="flex items-center gap-1">
				<span className="text-sm font-bold bg-muted px-4 py-2 rounded-lg border border-border">Page {currentPage} of {totalPages}</span>
			</div>
			<Button variant="outline" className="rounded-xl border-border bg-card" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
				Next <ChevronRight className="w-4 h-4 ml-2"/>
			</Button>
		</div>
	);
}
