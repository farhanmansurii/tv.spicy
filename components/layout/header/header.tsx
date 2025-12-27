'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Bookmark, History, Home, Keyboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import { SearchCommandBox } from '@/components/features/search/search-command-box';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useHasMounted } from '@/hooks/use-has-mounted';

// Type bypass for framer-motion strictness issues
const MotionDiv = motion.div as any;
const MotionLi = motion.li as any;

const menuItems = [
	{ name: 'TV Shows', href: '/tv', icon: '📺' },
	{ name: 'Movies', href: '/movie', icon: '🎬' },
	{ name: 'Genres', href: '/genres', icon: '🎭' },
];

export const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [quickMenuOpen, setQuickMenuOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const hasMounted = useHasMounted();

	const { watchlist, tvwatchlist } = useWatchListStore();
	const { recentlyWatched } = useTVShowStore();

	const watchlistCount = hasMounted ? (watchlist?.length || 0) + (tvwatchlist?.length || 0) : 0;
	const recentlyWatchedCount = hasMounted ? recentlyWatched?.length || 0 : 0;

	// Scroll handler with throttling
	useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setIsScrolled(window.scrollY > 20);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
	}, [mobileMenuOpen]);

	// Close mobile menu on route change
	useEffect(() => setMobileMenuOpen(false), [pathname]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd/Ctrl + K for search
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				const searchButton = document.querySelector('[data-search-trigger]');
				if (searchButton) {
					(searchButton as HTMLElement).click();
				}
			}
			// Escape to close menus
			if (e.key === 'Escape') {
				setMobileMenuOpen(false);
				setQuickMenuOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const handleQuickAction = useCallback((action: string) => {
		setQuickMenuOpen(false);
		switch (action) {
			case 'home':
				router.push('/');
				break;
			case 'watchlist':
				router.push('/?tab=watchlist');
				break;
			case 'recent':
				router.push('/?tab=recent');
				break;
			case 'genres':
				router.push('/genres');
				break;
		}
	}, [router]);

	return (
		<>
			<header
				className={cn(
					'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
					isScrolled
						? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg py-3'
						: 'bg-gradient-to-b from-black/90 via-black/60 to-transparent py-4 border-transparent'
				)}
			>
				<Container className="flex items-center justify-between px-4 md:px-8">
					{/* Logo */}
					<Link
						href="/"
						className="flex gap-3 items-center group relative z-50 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
						aria-label="SpicyTV Home"
					>
						<div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/10">
							<img
								src="/logo.webp"
								alt="SpicyTV"
								className="w-full h-full object-cover"
								loading="eager"
							/>
						</div>
						<p className="font-bold text-lg tracking-tight text-white group-hover:opacity-90 transition-opacity">
							Spicy<span className="text-primary">TV</span>
						</p>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-label="Main navigation">
						<ul className="flex items-center gap-8">
							{menuItems.map((item) => {
								const isActive =
									item.href === '/genres'
										? pathname === '/genres'
										: pathname.startsWith(item.href);

								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={cn(
												'text-sm font-medium transition-all duration-300 relative py-2 px-1 group',
												isActive
													? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'
													: 'text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
											)}
											aria-current={isActive ? 'page' : undefined}
										>
											<span className="relative z-10">{item.name}</span>
											{/* Active Indicator */}
											{isActive && (
												<MotionDiv
													layoutId="active-indicator"
													className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_currentColor]"
													transition={{
														type: 'spring',
														stiffness: 300,
														damping: 30,
													}}
												/>
											)}
											{/* Hover underline */}
											{!isActive && (
												<span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-2 z-50">
						{/* Quick Actions Menu - Desktop */}
						<DropdownMenu open={quickMenuOpen} onOpenChange={setQuickMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="hidden md:flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
								>
									<ChevronDown className="w-4 h-4" />
									<span className="text-sm font-medium">Quick</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border-white/10">
								<DropdownMenuLabel className="text-white">Quick Actions</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-white/10" />
								<DropdownMenuItem
									onClick={() => handleQuickAction('home')}
									className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
								>
									<Home className="w-4 h-4 mr-2" />
									<span>Home</span>
									<DropdownMenuShortcut>⌘H</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleQuickAction('watchlist')}
									className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
								>
									<Bookmark className="w-4 h-4 mr-2" />
									<span>My Watchlist</span>
									{watchlistCount > 0 && (
										<Badge variant="secondary" className="ml-auto bg-primary/20 text-primary text-xs">
											{watchlistCount}
										</Badge>
									)}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleQuickAction('recent')}
									className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
								>
									<History className="w-4 h-4 mr-2" />
									<span>Continue Watching</span>
									{recentlyWatchedCount > 0 && (
										<Badge variant="secondary" className="ml-auto bg-primary/20 text-primary text-xs">
											{recentlyWatchedCount}
										</Badge>
									)}
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-white/10" />
								<DropdownMenuItem
									onClick={() => handleQuickAction('genres')}
									className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
								>
									<span>Browse Genres</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Search */}
						<div data-search-trigger>
							<SearchCommandBox />
						</div>

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
							aria-expanded={mobileMenuOpen}
						>
							<AnimatePresence mode="wait">
								{mobileMenuOpen ? (
									<MotionDiv
										key="close"
										initial={{ rotate: -90, opacity: 0 }}
										animate={{ rotate: 0, opacity: 1 }}
										exit={{ rotate: 90, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<X className="w-5 h-5" />
									</MotionDiv>
								) : (
									<MotionDiv
										key="menu"
										initial={{ rotate: 90, opacity: 0 }}
										animate={{ rotate: 0, opacity: 1 }}
										exit={{ rotate: -90, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Menu className="w-5 h-5" />
									</MotionDiv>
								)}
							</AnimatePresence>
						</Button>
					</div>
				</Container>
			</header>

			{/* Mobile Menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<MotionDiv
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col"
					>
						{/* Mobile Menu Header */}
						<div className="flex items-center justify-between p-6 border-b border-white/10">
							<Link
								href="/"
								onClick={() => setMobileMenuOpen(false)}
								className="flex gap-3 items-center"
							>
								<div className="relative w-8 h-8 rounded-lg overflow-hidden">
									<img
										src="/logo.webp"
										alt="SpicyTV"
										className="w-full h-full object-cover"
									/>
								</div>
								<p className="font-bold text-lg tracking-tight text-white">
									Spicy<span className="text-primary">TV</span>
								</p>
							</Link>
						</div>

						{/* Mobile Menu Content */}
						<nav className="flex-1 flex flex-col justify-center items-center px-8">
							<ul className="flex flex-col gap-6 w-full max-w-md">
								{menuItems.map((item, index) => {
									const isActive =
										item.href === '/genres'
											? pathname === '/genres'
											: pathname.startsWith(item.href);
									return (
										<MotionLi
											key={item.name}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 10 }}
											transition={{ delay: index * 0.1 }}
											className="w-full"
										>
											<Link
												href={item.href}
												onClick={() => setMobileMenuOpen(false)}
												className={cn(
													'flex items-center gap-4 text-2xl font-bold tracking-tight transition-colors duration-200 py-3 px-4 rounded-lg',
													isActive
														? 'text-primary bg-primary/10'
														: 'text-zinc-400 hover:text-white hover:bg-white/5'
												)}
												aria-current={isActive ? 'page' : undefined}
											>
												<span className="text-3xl">{item.icon}</span>
												<span>{item.name}</span>
											</Link>
										</MotionLi>
									);
								})}
							</ul>

							{/* Mobile Quick Actions */}
							<div className="w-full max-w-md mt-8 pt-8 border-t border-white/10">
								<div className="grid grid-cols-2 gap-4">
									<Button
										variant="ghost"
										className="flex flex-col items-center gap-2 h-auto py-4 text-white/70 hover:text-white hover:bg-white/10"
										onClick={() => {
											handleQuickAction('watchlist');
											setMobileMenuOpen(false);
										}}
									>
										<Bookmark className="w-5 h-5" />
										<span className="text-sm font-medium">Watchlist</span>
										{watchlistCount > 0 && (
											<Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
												{watchlistCount}
											</Badge>
										)}
									</Button>
									<Button
										variant="ghost"
										className="flex flex-col items-center gap-2 h-auto py-4 text-white/70 hover:text-white hover:bg-white/10"
										onClick={() => {
											handleQuickAction('recent');
											setMobileMenuOpen(false);
										}}
									>
										<History className="w-5 h-5" />
										<span className="text-sm font-medium">Continue</span>
										{recentlyWatchedCount > 0 && (
											<Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
												{recentlyWatchedCount}
											</Badge>
										)}
									</Button>
								</div>
							</div>

							{/* Keyboard Shortcut Hint */}
							<div className="mt-8 pt-8 border-t border-white/10 w-full max-w-md">
								<div className="flex items-center gap-2 text-zinc-500 text-xs">
									<Keyboard className="w-4 h-4" />
									<span>Press ⌘K to search</span>
								</div>
							</div>
						</nav>
					</MotionDiv>
				)}
			</AnimatePresence>
		</>
	);
};
