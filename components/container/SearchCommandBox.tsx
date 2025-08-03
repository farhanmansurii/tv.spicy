'use client';

import * as React from 'react';
import { ArrowRightIcon, CornerDownLeftIcon, Loader2, Search } from 'lucide-react';

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
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useMutationObserver } from '@/lib/useMutationObserver';
import useSearchStore from '@/store/recentsSearchStore';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/lib/anime-helpers';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import Link from 'next/link';
import { Anime, Show } from '@/lib/types';
import { IconDeviceTv, IconMovie } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchCommandBox() {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState('');
	const { recentlySearched, addToRecentlySearched } = useSearchStore();
	const searchType = 'tvshow';
	const {
		data: searchResults,
		isFetching,
		error,
	} = useQuery({
		queryKey: ['search', query, searchType],
		queryFn: () =>
			searchType === 'tvshow'
				? searchShows(query).then((results) => ({
						...results,
						results: results.results
							.filter(
								(item: any) =>
									item.media_type === 'tv' || item.media_type === 'movie'
							)
							.sort((a: any, b: any) => {
								const aDate = a.release_date || a.first_air_date;
								const bDate = b.release_date || b.first_air_date;
								if (!aDate && !bDate) return 0;
								if (!aDate) return 1;
								if (!bDate) return -1;
								return new Date(bDate).getTime() - new Date(aDate).getTime();
							}),
					}))
				: fetchData(`advanced-search?query=${query}`, true),
		enabled: query.trim().length > 0,
	});

	const debouncedSearch = useCallback(
		debounce((value: string) => {
			setQuery(value.length >= 2 ? value : '');
		}, 500),
		[]
	);

	const handleInputChange = (value: string) => {
		debouncedSearch(value);
	};

	const handleSelectShow = (show: Show | Anime) => {
		addToRecentlySearched(show);
		setOpen((open) => !open);
		setQuery('');
	};

	const getFormattedDate = (item: {
		releaseDate?: string;
		first_air_date?: string;
		release_date?: string;
	}) => {
		const dateString = item.releaseDate || item.first_air_date || item.release_date;
		if (!dateString) return null;
		if (typeof dateString !== 'string') return null;
		if (/^\d{4}$/.test(dateString)) return dateString;
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return null;
		return date.getFullYear().toString();
	};

	const renderSearchResults = () => {
		if (isFetching)
			return (
				<CommandItem>
					Loading <Loader2 className="w-4 h-4 animate-spin ml-1" />
				</CommandItem>
			);
		if (error) return <CommandEmpty>Error: {(error as Error).message}</CommandEmpty>;
		return query ? (
			<CommandGroup heading={`Search Results for ${query}`}>
				{searchResults?.results.map((item: any) => {
					const show = {
						id: item.id,
						title:
							typeof (item.name || item.title) === 'string'
								? item.name || item.title || ''
								: item.title?.userPreferred ||
									item.title?.english ||
									item.title?.romaji ||
									'Unknown Title',
						type: item.media_type || 'anime',
						date: getFormattedDate(item),
					};

					return (
						<CommandItem
							key={show.id}
							onSelect={() => handleSelectShow(item)}
							value={show.title}
							className="data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent !px-3 font-medium"
						>
							<Link
								href={`/${show.type}/${show.id}`}
								className="flex items-center gap-2  w-full"
							>
								<span>
									{show.type === 'tv' ? (
										<IconDeviceTv size={16} color="lightblue" />
									) : (
										<IconMovie size={16} color="lightyellow" />
									)}
								</span>
								<span className="line-clamp-1">
									{show.title} {show.date && `(${show.date})`}
								</span>
							</Link>
						</CommandItem>
					);
				})}
			</CommandGroup>
		) : (
			<CommandGroup heading={'Previous Searches'}>
				{recentlySearched.map((item: any) => {
					const show = {
						id: item.id,
						title:
							typeof (item.name || item.title) === 'string'
								? item.name || item.title || ''
								: item.title?.userPreferred ||
									item.title?.english ||
									item.title?.romaji ||
									'Unknown Title',
						type: item.media_type || 'anime',
						date: getFormattedDate(item),
					};
					return (
						<CommandItem
							key={show.id}
							onSelect={() => handleSelectShow(item)}
							value={show.title}
							className="flex items-center justify-center"
						>
							<Link
								href={`/${show.type}/${show.id}`}
								className="flex items-center gap-2  w-full"
							>
								<span>
									{show.type === 'tv' ? (
										<IconDeviceTv size={16} color="lightblue" />
									) : (
										<IconMovie size={16} color="lightyellow" />
									)}
								</span>
								<span className="line-clamp-1">
									{show.title} {show.date && `(${show.date})`}
								</span>
							</Link>
						</CommandItem>
					);
				})}
			</CommandGroup>
		);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setOpen(false);
		}
	};

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="!w-44 lg:!w-56 xl:!w-64" asChild>
				<Button
					variant="secondary"
					className={cn(
						'relative h-8 w-full justify-start pl-2.5 font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64'
					)}
				>
					<Search className="size-4" />
					<span>Search...</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800">
				<DialogHeader className="sr-only">
					<DialogTitle>Search...</DialogTitle>
					<DialogDescription>Search for a command to run...</DialogDescription>
				</DialogHeader>
				<Command className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border">
					<CommandInput
						className="w-24"
						onValueChange={handleInputChange}
						placeholder="Search..."
					/>
					<CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
						<CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
							No results found.
						</CommandEmpty>
						{renderSearchResults()}
					</CommandList>
				</Command>
				{query && (
					<div className="text-muted-foreground  absolute inset-x-0 bottom-0 z-20 flex  items-center gap-2 rounded-lg h-10 m-1  py-2 px-2 text-xs justify-between font-medium dark:bg-neutral-800">
						<Link
							onClick={() => {
								setOpen(false);
							}}
							href={`/search?q=${query}`}
							className="flex items-center h-8 px-3 gap-2 hover:bg-foreground/10 rounded-lg"
						>
							<ArrowRightIcon size={16} />
							See More for {query}
						</Link>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<'kbd'>) {
	return (
		<kbd
			className={cn(
				"bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&_svg:not([class*='size-'])]:size-3",
				className
			)}
			{...props}
		/>
	);
}
