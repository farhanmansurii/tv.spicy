'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import { SearchCommandBox } from '@/components/features/search/search-command-box';

// Type bypass for framer-motion strictness issues
const MotionDiv = motion.div as any;
const MotionLi = motion.li as any;

const menuItems = [
	{ name: 'TV Shows', href: '/tv' },
	{ name: 'Movies', href: '/movie' },
	{ name: 'Genres', href: '/genres' },
];

export const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
	}, [mobileMenuOpen]);

	useEffect(() => setMobileMenuOpen(false), [pathname]);

	return (
		<>
			<header
				className={cn(
					'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
					isScrolled
						? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-4'
						: 'bg-gradient-to-b from-black/80 to-transparent py-6 border-transparent'
				)}
			>
				<Container className="flex items-center justify-between px-4 md:px-8">
					{/* Logo */}
					<Link
						href="/"
						className="flex gap-3 items-center group relative z-50 outline-none"
					>
						<div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
							<img
								src="/logo.webp"
								alt="SpicyTV"
								className="w-full h-full object-cover"
							/>
						</div>
						<p className="font-bold text-lg tracking-tight text-white group-hover:opacity-90 transition-opacity">
							Spicy<span className="text-primary">TV</span>
						</p>
					</Link>

					{/* Desktop Navigation - Clean Text Only */}
					<nav className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
												'text-sm font-medium transition-all duration-300 relative py-2',
												isActive
													? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'
													: 'text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
											)}
										>
											{item.name}
											{/* Minimal Active Indicator Dot */}
											{isActive && (
												<MotionDiv
													layoutId="active-dot"
													className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_currentColor]"
													transition={{
														type: 'spring',
														stiffness: 300,
														damping: 30,
													}}
												/>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-2 z-50">
						<SearchCommandBox />

						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

			{/* Mobile Menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<MotionDiv
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col justify-center items-center"
					>
						<nav className="w-full max-w-md px-8 text-center">
							<ul className="flex flex-col gap-8">
								{menuItems.map((item, index) => {
									const isActive = pathname.startsWith(item.href);
									return (
										<MotionLi
											key={item.name}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ delay: index * 0.05 }}
										>
											<Link
												href={item.href}
												onClick={() => setMobileMenuOpen(false)}
												className={cn(
													'text-2xl font-bold tracking-tight transition-colors duration-200',
													isActive ? 'text-primary' : 'text-zinc-400'
												)}
											>
												{item.name}
											</Link>
										</MotionLi>
									);
								})}
							</ul>
						</nav>
					</MotionDiv>
				)}
			</AnimatePresence>
		</>
	);
};
