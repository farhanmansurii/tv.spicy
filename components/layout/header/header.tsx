'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, CaretLeft } from '@phosphor-icons/react';
import { SearchTrigger } from '@/components/features/search/search-trigger';

import { useSidebar } from '@/components/ui/sidebar';
import { HeaderActions } from './header-actions';
import { HeaderNavigation } from './header-navigation';
import { navigationItems } from './navigation-data';
import { cn } from '@/lib/utils';
import { useEpisodeStore } from '@/store/episodeStore';
import { useSession } from '@/lib/auth-client';

interface HeaderProps {
	className?: string;
}

/* ── Shared glass surface styles ── */
const glassOrb =
	'flex items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.35)]';

const glassPill =
	'flex items-center rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.35)]';

export function Header({ className }: HeaderProps) {
	const [scrolled, setScrolled] = React.useState(false);
	const pathname = usePathname();
	const { toggleSidebar, openMobile } = useSidebar();
	const isPlayerSticky = useEpisodeStore((state) => state.isPlayerSticky);
	const { data: session } = useSession();

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
		<>
			{/* ═══════════════════════════════════════════
				    DESKTOP — sticky full-width bar
			   ═══════════════════════════════════════════ */}
			<header
				className={cn(
					'hidden lg:block z-50 w-full',
					isPlayerSticky ? 'relative' : 'sticky top-0',
					className
				)}
				role="banner"
				aria-label="Main navigation"
			>
				<div
					className={cn(
						'absolute inset-0 transition-all duration-300',
						scrolled
							? 'bg-black/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.06]'
							: 'bg-transparent'
					)}
					style={scrolled ? { boxShadow: '0 4px 24px rgba(0,0,0,0.35)' } : undefined}
				/>
				<div className="relative mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
					<div className="flex h-[52px] sm:h-[56px] items-center justify-between gap-3">
						<Link
							href="/"
							className={cn(
								'group flex items-center gap-2 rounded-xl px-1.5 py-1 -ml-1.5',
								'transition-all duration-200',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
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
							<span className="text-[15px] sm:text-base font-semibold tracking-tight text-white/90 transition-colors duration-200 group-hover:text-white font-sans">
								Spicy TV
							</span>
						</Link>

						<nav
							className="flex flex-1 items-center justify-center"
							aria-label="Primary"
						>
							<HeaderNavigation items={navigationItems} isActive={isActive} />
						</nav>

						<div className="flex items-center gap-1.5 sm:gap-2">
							<HeaderActions />
						</div>
					</div>
				</div>
			</header>

			{/* ═══════════════════════════════════════════
				    MOBILE — detached floating glass controls
			   ═══════════════════════════════════════════ */}
			<header className="lg:hidden fixed top-3 left-0 right-0 z-50 px-3">
				<div className="flex items-center justify-between gap-3">
					{/* ── Left: brand orb (home) or back orb (detail) ── */}
					{pathname === '/' ? (
						/* Home → logo + Spicy TV text */
						<Link
							href="/"
							className={cn(
								glassOrb,
								'h-12 px-3 gap-2',
								'touch-manipulation select-none',
								'active:scale-[0.96] transition-transform duration-150'
							)}
							aria-label="Go to home page"
						>
							<img src="/logo.webp" alt="" className="h-8 w-8 object-contain" />
							{/* <span className="text-[13px] font-semibold tracking-tight text-white/90 whitespace-nowrap">
								Spicy TV
							</span> */}
						</Link>
					) : (
						/* Detail → back */
						<motion.button
							whileTap={{ scale: 0.88 }}
							onClick={() => window.history.back()}
							className={cn(
								glassOrb,
								'h-12 w-12',
								'text-white/80 hover:text-white',
								'transition-colors duration-200',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
								'touch-manipulation select-none'
							)}
							aria-label="Go back"
						>
							<CaretLeft size={20} weight="bold" />
						</motion.button>
					)}

					{/* ── Right: actions pill (plain icons, no nested borders) ── */}
					<div className={cn(glassPill, 'h-12 pl-1 pr-1.5 gap-0')}>
						{/* Search — plain icon, no individual background */}
						<SearchTrigger variant="icon" />

						{/* Profile — plain icon, no individual background */}
						<Link
							href={session?.user ? '/profile' : '/auth/signin'}
							className={cn(
								'flex items-center justify-center',
								'w-11 h-11',
								'text-white/60 hover:text-white/90',
								'transition-colors duration-200',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
								'touch-manipulation select-none'
							)}
							aria-label="Profile"
						>
							{session?.user?.image ? (
								<img
									src={session.user.image}
									alt=""
									className="w-7 h-7 rounded-full object-cover"
								/>
							) : (
								<UserIcon size={20} weight="regular" />
							)}
						</Link>

						{/* Hamburger — plain icon, no individual background */}
						<motion.button
							whileTap={{ scale: 0.88 }}
							onClick={toggleSidebar}
							className={cn(
								'flex items-center justify-center',
								'w-11 h-11',
								'text-white/60 hover:text-white/90',
								'transition-colors duration-200',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
								'touch-manipulation select-none'
							)}
							aria-label={openMobile ? 'Close menu' : 'Open menu'}
							aria-expanded={openMobile}
						>
							<div className="relative w-5 h-5 flex items-center justify-center">
								<AnimatePresence mode="wait" initial={false}>
									{openMobile ? (
										<motion.svg
											key="close"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2.2}
											strokeLinecap="round"
											className="w-5 h-5"
											initial={{ rotate: -45, opacity: 0 }}
											animate={{ rotate: 0, opacity: 1 }}
											exit={{ rotate: 45, opacity: 0 }}
											transition={{
												duration: 0.15,
												ease: [0.23, 1, 0.32, 1],
											}}
										>
											<line x1="5" y1="5" x2="19" y2="19" />
											<line x1="19" y1="5" x2="5" y2="19" />
										</motion.svg>
									) : (
										<motion.svg
											key="open"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											className="w-5 h-5"
											initial={{ rotate: 45, opacity: 0 }}
											animate={{ rotate: 0, opacity: 1 }}
											exit={{ rotate: -45, opacity: 0 }}
											transition={{
												duration: 0.15,
												ease: [0.23, 1, 0.32, 1],
											}}
										>
											<line x1="4" y1="7" x2="20" y2="7" />
											<line x1="4" y1="12" x2="20" y2="12" />
											<line x1="4" y1="17" x2="20" y2="17" />
										</motion.svg>
									)}
								</AnimatePresence>
							</div>
						</motion.button>
					</div>
				</div>
			</header>
		</>
	);
}
