'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

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
import { LayoutDashboard, Search, Clapperboard, MonitorPlay } from 'lucide-react';
import { Button } from '../ui/button';

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
	const router = useRouter();
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = searchText.trim();
		if (trimmed.length > 1) {
			router.push(`/search?q=${encodeURIComponent(trimmed)}`);
			setSearchText('');
			toggleSidebar();
		}
	};

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
						{['movie', 'tv'].map((type) =>
							genres[type]?.length > 0 ? (
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
							) : null
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
