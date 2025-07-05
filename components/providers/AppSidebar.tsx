'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	useSidebar,
} from '@/components/ui/sidebar';

import { Collapsible } from '@/components/ui/collapsible';

import { Input } from '@/components/ui/input';
import { LayoutDashboard, Search, Clapperboard, MonitorPlay, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { searchTMDB } from '@/lib/searchUtils';
import { Show } from '@/lib/types';

export function AppSidebar() {
	const { setOpen, toggleSidebar } = useSidebar();
	const [openSection, setOpenSection] = React.useState<string | null>(null);
	const pathname = usePathname();

	React.useEffect(() => {
		setOpenSection(null);
	}, [pathname]);

	const isActive = (href: string) => pathname === href;

	const handleLinkClick = () => setOpen(false);
	const [searchText, setSearchText] = React.useState('');
	const [showResults, setShowResults] = React.useState(false);
	const router = useRouter();
	
	// Debounce search text
	const debouncedSearchText = useDebounce(searchText, 300);

	// Search query
	const { data: searchResults, isFetching } = useQuery({
		queryKey: ['sidebar-search', debouncedSearchText],
		queryFn: () => searchTMDB(debouncedSearchText),
		enabled: debouncedSearchText.length >= 2,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Show/hide results based on search text and focus
	React.useEffect(() => {
		setShowResults(searchText.length >= 2);
	}, [searchText]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = searchText.trim();
		if (trimmed.length > 1) {
			router.push(`/search?q=${encodeURIComponent(trimmed)}`);
			setSearchText('');
			setShowResults(false);
			toggleSidebar();
		}
	};

	const handleResultClick = () => {
		setSearchText('');
		setShowResults(false);
		setOpen(false);
	};

	const handleShowMoreClick = () => {
		const trimmed = searchText.trim();
		if (trimmed.length > 1) {
			router.push(`/search?q=${encodeURIComponent(trimmed)}`);
			setSearchText('');
			setShowResults(false);
			toggleSidebar();
		}
	};

	// Get top 5 results for sidebar display
	const sidebarResults = searchResults?.results?.slice(0, 5) || [];

	return (
		<Sidebar variant="floating" side="left">
			<SidebarContent>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="data-[slot=sidebar-menu-button]:!p-1.5"
							>
								<Link
									href="/"
									className="flex items-center h-10"
									onClick={handleLinkClick}
								>
									<img src="/logo.webp" alt="App logo" className="w-10 h-10" />
									<span className="text-base font-semibold ml-2">SpicyTV</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<form
								onSubmit={handleSearchSubmit}
								className="w-full flex items-center gap-2"
							>
								<Input
									placeholder="Search..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onBlur={() => {
										// Delay hiding results to allow clicks on results
										setTimeout(() => setShowResults(false), 150);
									}}
									onFocus={() => {
										if (searchText.length >= 2) {
											setShowResults(true);
										}
									}}
									className="flex-1"
								/>
								<Button
									variant={'secondary'}
									size={'icon'}
									type="submit"
									onClick={(e) => {
										handleSearchSubmit(e);
										setOpen(false);
									}}
									aria-label="Search"
								>
									<Search className="w-4 h-4" />
								</Button>
							</form>
						</SidebarMenuItem>
						
						{/* Search Results */}
						{showResults && (
							<SidebarMenuItem>
								<div className="w-full space-y-1">
									{isFetching ? (
										<div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Searching...</span>
										</div>
									) : sidebarResults.length > 0 ? (
										<>
											{sidebarResults.map((show: Show) => {
												const title = show.title || show.name;
												const year = show.release_date
													? new Date(show.release_date).getFullYear()
													: show.first_air_date
													? new Date(show.first_air_date).getFullYear()
													: '';
												const href = show.media_type === 'movie' ? `/movie/${show.id}` : `/tv/${show.id}`;
												
												return (
													<Link
														key={show.id}
														href={href}
														onClick={handleResultClick}
														className="block p-2 rounded hover:bg-accent transition-colors"
													>
														<div className="flex items-center justify-between">
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium truncate">{title}</p>
																<p className="text-xs text-muted-foreground">
																	{show.media_type === 'movie' ? 'Movie' : 'TV Show'} {year && `• ${year}`}
																</p>
															</div>
														</div>
													</Link>
												);
											})}
											{searchResults?.results && searchResults.results.length > 5 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={handleShowMoreClick}
													className="w-full text-primary hover:text-primary/80"
												>
													Show more results
												</Button>
											)}
										</>
									) : debouncedSearchText.length >= 2 ? (
										<div className="p-2 text-sm text-muted-foreground">
											No results found
										</div>
									) : null}
								</div>
							</SidebarMenuItem>
						)}
					</SidebarMenu>
				</SidebarHeader>

				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link
									href="/"
									onClick={handleLinkClick}
									className={clsx(
										'flex items-center',
										isActive('/') && 'text-primary font-semibold'
									)}
								>
									<LayoutDashboard className="mr-2 h-4 w-4" />
									<span>Home</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link
									href="/search"
									onClick={handleLinkClick}
									className={clsx(
										'flex items-center',
										isActive('/search') && 'text-primary font-semibold'
									)}
								>
									<Search className="mr-2 h-4 w-4" />
									<span>Search</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Categories</SidebarGroupLabel>
					<SidebarMenu>
						{['movie', 'tv'].map((type) => (
							<SidebarMenuItem key={type}>
								<Collapsible
									open={openSection === type}
									onOpenChange={() =>
										setOpenSection(openSection === type ? null : type)
									}
								>
									<div className="flex items-center justify-between">
										<SidebarMenuButton asChild>
											<Link
												href={`/${type}`}
												onClick={handleLinkClick}
												className={clsx(
													'flex items-center',
													isActive(`/${type}`) &&
														'text-primary font-semibold'
												)}
											>
												{type === 'movie' ? (
													<Clapperboard className="mr-2 h-4 w-4" />
												) : (
													<MonitorPlay className="mr-2 h-4 w-4" />
												)}
												<span>
													{type === 'movie' ? 'Movies' : 'TV Shows'}
												</span>
											</Link>
										</SidebarMenuButton>
									</div>
								</Collapsible>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
