'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSidebar } from '@/components/ui/sidebar';
import { HeaderActions } from './header-actions';
import { HeaderNavigation } from './header-navigation';
import { navigationItems } from './navigation-data';
import { cn } from '@/lib/utils';

interface HeaderProps {
	className?: string;
}

/**
 * Header Component - Apple Human Interface Guidelines Compliant
 *
 * Design Principles:
 * - 44pt minimum touch targets (Apple HIG)
 * - SF Pro typography scale with -0.41 letter-spacing
 * - Frosted glass blur effects (backdrop-blur-2xl)
 * - Smooth spring animations with damping
 * - Layered depth with subtle shadows
 * - Accessibility first with proper ARIA
 * - Desktop: Inline navigation with refined dropdowns
 * - Mobile: Elegant sidebar with smooth hamburger animation
 */
export function Header({ className }: HeaderProps) {
	const [scrolled, setScrolled] = React.useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const pathname = usePathname();
	const { toggleSidebar } = useSidebar();

	// Apple-style scroll detection with passive listener and hysteresis
	React.useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					// Apple uses ~12px threshold for header state changes
					setScrolled(window.scrollY > 12);
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close mobile menu on route change
	React.useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full',
				'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
				className
			)}
			role="banner"
			aria-label="Main navigation"
		>
			{/* Liquid Glass Background Layer */}
			<div
				className={cn(
					'absolute inset-0 transition-all duration-500',
					// Heavy blur + high saturation = picks up and intensifies background colors
					'backdrop-blur-3xl backdrop-saturate-[2.5] backdrop-brightness-[1.02]',
					scrolled ? 'bg-background/50' : 'bg-background/20'
				)}
			/>

			{/* Color Vibrancy Layer - enhances color bleeding through */}
			<div
				className={cn(
					'absolute inset-0 transition-all duration-500',
					'backdrop-saturate-[160%] backdrop-brightness-[90%]',
					scrolled ? 'opacity-100' : 'opacity-95'
				)}
				style={{
					backgroundColor: 'rgba(15, 15, 15, 0.7)',

					boxShadow: `
      inset 0 0.5px 0 0 rgba(255, 255, 255, 0.3),
      inset 0 -0.5px 0 0 rgba(255, 255, 255, 0.1),
      0 12px 40px rgba(0, 0, 0, 0.4)
    `,

					border: '0.5px solid rgba(255, 255, 255, 0.08)',

					mixBlendMode: 'normal',
				}}
			>
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background:
							'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)',
					}}
				/>
			</div>

			{/* Inner highlight - top edge glow */}
			<div
				className={cn(
					'absolute top-0 left-0 right-0 h-[1px]',
					'bg-gradient-to-r from-transparent via-white/[0.07] to-transparent',
					'transition-opacity duration-500',
					scrolled ? 'opacity-100' : 'opacity-50'
				)}
			/>

			{/* Bottom liquid edge - creates the dripping/leak effect */}
			<div
				className={cn(
					'absolute bottom-0 left-0 right-0 h-[2px]',
					'transition-all duration-500',
					scrolled
						? 'bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-100'
						: 'bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-60'
				)}
			/>

			{/* Color leak glow beneath header */}
			<div
				className={cn(
					'absolute -bottom-6 left-[10%] right-[10%] h-12',
					'bg-gradient-to-b from-foreground/[0.03] to-transparent',
					'blur-xl',
					'pointer-events-none',
					'transition-opacity duration-700',
					scrolled ? 'opacity-100' : 'opacity-0'
				)}
			/>

			{/* Main Header Bar */}
			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-[60px] sm:h-[64px] items-center justify-between gap-4">
					{/* Left: Logo with refined hover state */}
					<div className="flex items-center">
						<Link
							href="/"
							className={cn(
								'group flex items-center gap-2.5',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
								'rounded-xl px-2 py-1.5 -ml-2',
								'transition-all duration-300 ease-out',
								'hover:bg-foreground/[0.03] active:bg-foreground/[0.05]',
								'touch-manipulation'
							)}
							aria-label="Go to home page"
						>
							<div className="relative h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
								<Image
									src="/logo.webp"
									alt="Watvh TV"
									fill
									className="object-contain drop-shadow-sm"
									priority
									sizes="(max-width: 640px) 32px, 36px"
								/>
							</div>
							<span className="hidden sm:inline-block text-[17px] font-semibold tracking-[-0.41px] text-foreground/90 transition-colors duration-300 group-hover:text-foreground">
								Watvh TV
							</span>
						</Link>
					</div>

					{/* Center: Desktop Navigation - Hidden on mobile */}
					<nav
						className="hidden lg:flex items-center flex-1 justify-center"
						aria-label="Main navigation"
					>
						<HeaderNavigation items={navigationItems} isActive={isActive} />
					</nav>

					{/* Right: Actions + Mobile Menu Trigger */}
					<div className="flex items-center gap-1 sm:gap-2">
						<HeaderActions />

						{/* Mobile only - Animated hamburger menu button */}
						<div className="lg:hidden ml-1">
							<button
								onClick={toggleSidebar}
								className={cn(
									'relative flex items-center justify-center',
									'h-11 w-11 rounded-full',
									'bg-foreground/[0.03] hover:bg-foreground/[0.06] active:bg-foreground/[0.08]',
									'border border-border/40 hover:border-border/60',
									'transition-all duration-300 ease-out',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
									'touch-manipulation',
									'group'
								)}
								aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
								aria-expanded={mobileMenuOpen}
							>
								<div className="relative w-5 h-5 flex items-center justify-center">
									<AnimatePresence mode="wait" initial={false}>
										{mobileMenuOpen ? (
											<motion.div
												key="close"
												initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
												animate={{ rotate: 0, opacity: 1, scale: 1 }}
												exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
												transition={{
													duration: 0.2,
													ease: [0.23, 1, 0.32, 1],
												}}
											>
												<X
													className="h-5 w-5 text-foreground/80"
													strokeWidth={2}
												/>
											</motion.div>
										) : (
											<motion.div
												key="menu"
												initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
												animate={{ rotate: 0, opacity: 1, scale: 1 }}
												exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
												transition={{
													duration: 0.2,
													ease: [0.23, 1, 0.32, 1],
												}}
											>
												<Menu
													className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors"
													strokeWidth={2}
												/>
											</motion.div>
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
