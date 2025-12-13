'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import { SearchCommandBox } from '@/components/features/search/search-command-box';
import { usePathname } from 'next/navigation';

const menuItems = [
	{ name: 'TV Shows', href: '/tv' },
	{ name: 'Movies', href: '/movie' },
	{ name: 'Genres', href: '/genres' },
];

export const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	// Handle scroll detection for glass effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
	}, [mobileMenuOpen]);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	return (
		<>
			<header
				className={cn(
					'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b',
					isScrolled
						? 'bg-background/70 backdrop-blur-xl border-border/40 py-3'
						: 'bg-transparent border-transparent py-5'
				)}
			>
				<Container className="flex items-center justify-between px-4 md:px-8">
					{/* Logo Section */}
					<Link
						href="/"
						aria-label="home"
						className="flex gap-2.5 items-center group relative z-50"
					>
						<div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
							<img
								src={'/logo.webp'}
								alt="SpicyTV Logo"
								className="w-full h-full object-cover"
							/>
						</div>
						<p className="font-bold text-lg tracking-tighter text-foreground group-hover:opacity-90 transition-opacity">
							Spicy<span className="text-primary">TV</span>
						</p>
					</Link>

					{/* Desktop Navigation (Floating Pill) */}
					<nav className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
						<ul className="flex items-center gap-1 p-1.5 rounded-full bg-secondary/30 border border-white/5 backdrop-blur-2xl shadow-sm">
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
												'px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-out',
												isActive
													? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
													: 'text-muted-foreground hover:text-foreground hover:bg-white/5'
											)}
										>
											{item.name}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-3 md:gap-4 z-50">
						<SearchCommandBox />

						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden text-foreground hover:bg-white/10 rounded-full"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</Button>
					</div>
				</Container>
			</header>

			{/* Mobile Menu Overlay (Full Screen) */}
			<div
				className={cn(
					'fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl transition-all duration-500 ease-in-out lg:hidden flex flex-col justify-center items-center',
					mobileMenuOpen
						? 'opacity-100 translate-y-0 pointer-events-auto'
						: 'opacity-0 -translate-y-4 pointer-events-none'
				)}
			>
				<nav className="w-full max-w-md px-6">
					<ul className="flex flex-col gap-6 items-center">
						{menuItems.map((item, index) => {
							const isActive =
								item.href === '/genres'
									? pathname === '/genres'
									: pathname.startsWith(item.href);

							return (
								<li
									key={item.name}
									className="w-full text-center"
									style={{
										transitionDelay: `${index * 50}ms`,
										opacity: mobileMenuOpen ? 1 : 0,
										transform: mobileMenuOpen
											? 'translateY(0)'
											: 'translateY(10px)',
										transition: 'all 0.4s ease-out',
									}}
								>
									<Link
										href={item.href}
										className={cn(
											'block text-3xl font-bold tracking-tight py-2 transition-colors duration-300',
											isActive
												? 'text-primary'
												: 'text-muted-foreground hover:text-foreground'
										)}
										onClick={() => setMobileMenuOpen(false)}
									>
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Mobile Menu Footer */}
				<div className="absolute bottom-10 text-muted-foreground text-sm">
					<p>© {new Date().getFullYear()} SpicyTV</p>
				</div>
			</div>
		</>
	);
};
