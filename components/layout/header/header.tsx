'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useSidebar } from '@/components/ui/sidebar';
import { HeaderActions } from './header-actions';
import { HeaderNavigation } from './header-navigation';
import { navigationItems } from './navigation-data';
import { cn } from '@/lib/utils';
import { useEpisodeStore } from '@/store/episodeStore';

interface HeaderProps {
	className?: string;
}

export function Header({ className }: HeaderProps) {
	const [scrolled, setScrolled] = React.useState(false);
	const pathname = usePathname();
	const { toggleSidebar, openMobile } = useSidebar();
	const isPlayerSticky = useEpisodeStore((state) => state.isPlayerSticky);

	React.useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setScrolled(window.scrollY > 8);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href);

	return (
		<header
			className={cn(
				'z-50 w-full',
				isPlayerSticky ? 'relative' : 'sticky top-0',
				className
			)}
			role="banner"
			aria-label="Main navigation"
		>
			{/* Glass background */}
			<div
				className={cn(
					'absolute inset-0 transition-all duration-400',
					scrolled
						? 'bg-zinc-950/80 backdrop-blur-2xl backdrop-saturate-[1.6]'
						: 'bg-transparent'
				)}
				style={
					scrolled
						? {
								borderBottom: '0.5px solid rgba(255,255,255,0.06)',
								boxShadow:
									'0 1px 0 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.4)',
							}
						: undefined
				}
			/>

			{/* Inner bar */}
			<div className="relative mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				<div className="flex h-[52px] sm:h-[56px] items-center justify-between gap-3">

					{/* Logo */}
					<Link
						href="/"
						className={cn(
							'group flex items-center gap-2 rounded-xl px-1.5 py-1 -ml-1.5',
							'transition-all duration-200',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
							'touch-manipulation'
						)}
						aria-label="Go to home page"
					>
						<div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-[0.96]">
							<img
								src="/logo.webp"
								alt="Spicy TV"
								loading="eager"
								fetchPriority="high"
								className="h-full w-full object-contain"
							/>
						</div>
						<span
							className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-white/90 transition-colors duration-200 group-hover:text-white"
							style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
						>
							Spicy TV
						</span>
					</Link>

					{/* Center nav — desktop only */}
					<nav className="hidden lg:flex flex-1 items-center justify-center" aria-label="Primary">
						<HeaderNavigation items={navigationItems} isActive={isActive} />
					</nav>

					{/* Right: actions + mobile trigger */}
					<div className="flex items-center gap-1.5 sm:gap-2">
						<HeaderActions />

						{/* Mobile hamburger */}
						<div className="lg:hidden">
							<button
								onClick={toggleSidebar}
								className={cn(
									'flex items-center justify-center w-9 h-9 rounded-full',
									'transition-all duration-200',
									scrolled
										? 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08]'
										: 'bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07]',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
									'touch-manipulation'
								)}
								aria-label={openMobile ? 'Close menu' : 'Open menu'}
								aria-expanded={openMobile}
							>
								<div className="relative w-4 h-4 flex items-center justify-center">
									<AnimatePresence mode="wait" initial={false}>
										{openMobile ? (
											<motion.svg
												key="close"
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												strokeWidth={2}
												strokeLinecap="round"
												className="w-4 h-4 text-white/75"
												initial={{ rotate: -45, opacity: 0 }}
												animate={{ rotate: 0, opacity: 1 }}
												exit={{ rotate: 45, opacity: 0 }}
												transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
											>
												<line x1="3" y1="3" x2="13" y2="13" />
												<line x1="13" y1="3" x2="3" y2="13" />
											</motion.svg>
										) : (
											<motion.svg
												key="open"
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												strokeWidth={1.75}
												strokeLinecap="round"
												className="w-4 h-4 text-white/75"
												initial={{ rotate: 45, opacity: 0 }}
												animate={{ rotate: 0, opacity: 1 }}
												exit={{ rotate: -45, opacity: 0 }}
												transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
											>
												<line x1="2" y1="5" x2="14" y2="5" />
												<line x1="2" y1="9" x2="14" y2="9" />
												<line x1="2" y1="13" x2="14" y2="13" />
											</motion.svg>
										)}
									</AnimatePresence>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
