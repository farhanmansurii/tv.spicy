'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { searchTMDB, fetchGenres } from '@/lib/searchUtils';
import useSearchStore from '@/store/recentsSearchStore';

import CommonContainer from '@/components/container/CommonContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Loader2, SlidersHorizontal, Search } from 'lucide-react';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import Row from '@/components/container/Row';

export default function SearchPageClient() {
	const searchParams = useSearchParams();
	const defaultQuery = searchParams.get('q') || '';

	const [inputValue, setInputValue] = useState(defaultQuery);
	const [query, setQuery] = useState(defaultQuery);

	const [showFilters, setShowFilters] = useState(false);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedYear, setSelectedYear] = useState<string | undefined>();
	const [minRating, setMinRating] = useState<number>(0);
	const [minRuntime, setMinRuntime] = useState<number>(0);
	const [language, setLanguage] = useState<string | undefined>();
	const [includeAdult, setIncludeAdult] = useState(false);
	const [sortBy, setSortBy] = useState<string>('popularity.desc');
	const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');

	const { recentlySearched } = useSearchStore();

	const { data: genreData } = useQuery({
		queryKey: ['genres', mediaType],
		queryFn: () => fetchGenres(mediaType === 'tv' ? 'tv' : 'movie'),
		staleTime: 86400000,
	});

	const {
		data: searchResults,
		isFetching,
		error,
		refetch,
	} = useQuery({
		queryKey: ['search', query],
		queryFn: () => searchTMDB(query),
		enabled: false,
	});

	const handleSearch = () => {
		if (inputValue.trim().length >= 2) {
			setQuery(inputValue);
			refetch();
		}
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

		const matchesRuntime = !minRuntime || (item.runtime ?? 0) >= minRuntime;

		const matchesLanguage = !language || item.original_language === language;

		const matchesAdult = includeAdult || !item.adult;

		return (
			matchesType &&
			matchesGenre &&
			matchesYear &&
			matchesRating &&
			matchesRuntime &&
			matchesLanguage &&
			matchesAdult
		);
	});

	return (
		<CommonContainer className="py-8 space-y-6">
			<h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground">
				Search
			</h1>

			<div className="flex flex-col sm:flex-row gap-4">
				<Input
					placeholder="Search for a movie or TV show..."
					className="w-full sm:w-4/5"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<Button onClick={handleSearch} className="flex items-center gap-2">
					<Search className="w-4 h-4" />
					<span>Search</span>
				</Button>
				<Button
					variant="ghost"
					onClick={() => setShowFilters((prev) => !prev)}
					className="sm:ml-auto"
				>
					<SlidersHorizontal className="w-4 h-4 mr-2" />
					{showFilters ? 'Hide Filters' : 'Show Filters'}
				</Button>
			</div>

			{showFilters && (
				<div className="rounded-lg border bg-muted/5 p-6 shadow-sm space-y-6">
					{/* Filter controls */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Media Type */}
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">Type</p>
							<Select
								value={mediaType}
								onValueChange={(val) => setMediaType(val as 'all' | 'tv' | 'movie')}
							>
								<SelectTrigger>
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="movie">Movie</SelectItem>
									<SelectItem value="tv">TV Show</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Year */}
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">Year</p>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger>
									<SelectValue placeholder="Any" />
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
						</div>

						{/* Language */}
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground">Language</p>
							<Select value={language} onValueChange={setLanguage}>
								<SelectTrigger>
									<SelectValue placeholder="Any" />
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
					</div>

					{/* Rating Slider */}
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">Minimum Rating</p>
						<div className="flex items-center w-[300px] gap-4">
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
				</div>
			)}

			{/* Results or Feedback */}
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
				<p className="text-muted-foreground text-sm">No results found for “{query}”</p>
			) : (
				<p className="text-muted-foreground text-sm">
					Start typing to find movies or shows.
				</p>
			)}
		</CommonContainer>
	);
}
