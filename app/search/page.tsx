'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchTMDB, fetchGenres } from '@/lib/searchUtils';
import useSearchStore from '@/store/recentsSearchStore';

import CommonContainer from '@/components/container/CommonContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Loader2, SlidersHorizontal, Search, X } from 'lucide-react';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import Row from '@/components/container/Row';
import CommonTitle from '@/components/animated-common/CommonTitle';

export default function SearchPageClient() {
	const searchParams = useSearchParams();
	const defaultQuery = searchParams.get('q') || '';

	const [inputValue, setInputValue] = useState(defaultQuery);
	const [query, setQuery] = useState(defaultQuery);

	const [showFilters, setShowFilters] = useState(false);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedYear, setSelectedYear] = useState<string | undefined>();
	const [minRating, setMinRating] = useState<number>(0);
	const [language, setLanguage] = useState<string | undefined>();
	const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');

	const { recentlySearched } = useSearchStore();

	// Fetch genres for TV or Movie
	const { data: genreData } = useQuery({
		queryKey: ['genres', mediaType],
		queryFn: () => fetchGenres(mediaType === 'tv' ? 'tv' : 'movie'),
		staleTime: 1000 * 60 * 60 * 24,
	});

	// Debounced search query
	const {
		data: searchResults,
		isFetching,
		error,
		refetch,
	} = useQuery({
		queryKey: ['search', inputValue],
		queryFn: () => searchTMDB(inputValue),
		enabled: false,
	});

	// Debounce effect
	useEffect(() => {
		const trimmed = inputValue.trim();

		if (trimmed.length < 2) return;

		const debounce = setTimeout(() => {
			setQuery(trimmed);
			refetch();
		}, 400); // ⏱ debounce delay

		return () => clearTimeout(debounce);
	}, [inputValue, refetch]);

	const resetFilters = () => {
		setSelectedGenres([]);
		setSelectedYear(undefined);
		setMinRating(0);
		setLanguage(undefined);
		setMediaType('all');
	};

	const resetSearch = () => {
		setInputValue('');
		setQuery('');
	};

	const handleGenreToggle = (id: number) => {
		setSelectedGenres((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
	};

	const filteredResults = (searchResults?.results || []).filter((item: any) => {
		const matchesType = mediaType === 'all' || item.media_type === mediaType;
		const matchesGenre =
			selectedGenres.length === 0 ||
			item.genre_ids?.some((id: number) => selectedGenres.includes(id));
		const matchesYear =
			!selectedYear ||
			item.release_date?.startsWith(selectedYear) ||
			item.first_air_date?.startsWith(selectedYear);
		const matchesRating = !minRating || (item.vote_average ?? 0) >= minRating;
		const matchesLanguage = !language || item.original_language === language;

		return matchesType && matchesGenre && matchesYear && matchesRating && matchesLanguage;
	});

	return (
		<CommonContainer className="py-8 space-y-8">
			<CommonTitle text="Search" />

			{/* Search input row */}
			<div className="flex flex-col sm:flex-row sm:items-center gap-3">
				<Input
					placeholder="Search for a movie or TV show..."
					className="w-full h-12"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<div className="flex gap-2">
					<Button variant="ghost" onClick={() => setShowFilters((prev) => !prev)}>
						<SlidersHorizontal className="w-4 h-4 mr-2" />
						{showFilters ? 'Hide Filters' : 'Show Filters'}
					</Button>
					{inputValue && (
						<Button variant="destructive" onClick={resetSearch}>
							<X className="w-4 h-4 mr-1" />
							Reset Search
						</Button>
					)}
				</div>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="rounded-md border bg-muted/5 px-5 py-6 space-y-5 shadow-sm">
					{/* Filter dropdowns */}
					<div className="flex flex-wrap gap-3">
						<Select
							value={mediaType}
							onValueChange={(val) => setMediaType(val as 'all' | 'movie' | 'tv')}
						>
							<SelectTrigger className="w-[130px]">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="movie">Movie</SelectItem>
								<SelectItem value="tv">TV</SelectItem>
							</SelectContent>
						</Select>

						<Select value={selectedYear} onValueChange={setSelectedYear}>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder="Year" />
							</SelectTrigger>
							<SelectContent>
								{Array.from({ length: 30 }, (_, i) => {
									const year = `${2024 - i}`;
									return (
										<SelectItem key={year} value={year}>
											{year}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>

						<Select value={language} onValueChange={setLanguage}>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="Language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="ja">Japanese</SelectItem>
								<SelectItem value="ko">Korean</SelectItem>
								<SelectItem value="fr">French</SelectItem>
								<SelectItem value="es">Spanish</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Rating slider */}
					<div className="flex items-center gap-4">
						<span className="text-xs font-medium text-muted-foreground">
							Min Rating
						</span>
						<Slider
							min={0}
							max={10}
							step={0.5}
							value={[minRating]}
							onValueChange={(val) => setMinRating(val[0])}
							className="w-full"
						/>
						<span className="text-sm w-10 text-right">{minRating.toFixed(1)}</span>
					</div>

					{/* Genres */}
					{genreData?.length > 0 && (
						<div className="space-y-2">
							<p className="text-xs font-medium text-muted-foreground">Genres</p>
							<div className="flex flex-wrap gap-2">
								{genreData.map((genre: any) => (
									<label
										key={genre.id}
										className="flex items-center gap-2 text-sm text-muted-foreground"
									>
										<Checkbox
											checked={selectedGenres.includes(genre.id)}
											onCheckedChange={() => handleGenreToggle(genre.id)}
										/>
										{genre.name}
									</label>
								))}
							</div>
						</div>
					)}

					{/* Reset button */}
					<div className="flex justify-end">
						<Button variant="destructive" size="sm" onClick={resetFilters}>
							Reset Filters
						</Button>
					</div>
				</div>
			)}

			{/* Results */}
			{isFetching ? (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="animate-spin w-4 h-4" />
					<span>Searching...</span>
				</div>
			) : query && filteredResults.length > 0 ? (
				<Row
					shows={filteredResults}
					text={`Results for "${query}"`}
					type="tvshow"
					isVertical
				/>
			) : query && filteredResults.length === 0 ? (
				<p className="text-muted-foreground text-sm">No results found for “{query}”.</p>
			) : (
				<p className="text-muted-foreground text-sm">
					Start typing to find something to watch.
				</p>
			)}
		</CommonContainer>
	);
}
