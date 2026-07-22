'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, CaretLeft, HouseIcon } from '@phosphor-icons/react';
import { SearchTrigger } from '@/components/features/search/search-trigger';
import { LiquidGlass } from '@/components/ui/liquid-glass';

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

const headerFocus =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const mobileAction = cn(
	'flex h-11 w-11 shrink-0 items-center justify-center rounded-full max-[359px]:h-10 max-[359px]:w-10',
	'text-white/90 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))] hover:bg-white/[0.07] hover:text-white active:bg-white/[0.11]',
	'touch-manipulation select-none transition-[color,background-color,transform] duration-200 ease-out active:scale-[0.96] motion-reduce:active:scale-100',
	headerFocus
);

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
						'absolute inset-0 transition-[background-color,backdrop-filter,border-color] duration-200 ease-out',
						scrolled
							? 'border-b border-white/[0.07] bg-black/78 backdrop-blur-xl backdrop-saturate-150'
							: 'bg-transparent'
					)}
				/>
				<div className="relative mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
					<div className="flex h-14 items-center justify-between gap-6">
						<Link
							href="/"
							className={cn(
								'group -ml-1.5 flex h-11 items-center gap-2 rounded-md px-1.5',
								'transition-colors duration-200',
								headerFocus,
								'touch-manipulation'
							)}
							aria-label="Go to home page"
						>
							<div className="relative h-8 w-8 flex-shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.03] group-active:scale-[0.97]">
								<img
									src="/logo.webp"
									alt="Spicy TV"
									loading="eager"
									fetchPriority="high"
									className="h-full w-full object-contain"
								/>
							</div>
							<span className="font-sans text-[15px] font-semibold tracking-[-0.02em] text-white/90 transition-colors duration-200 group-hover:text-white">
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
			<header
				className={cn('fixed left-0 right-0 z-50 lg:hidden', isPlayerSticky && 'absolute')}
				style={{
					top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
					paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 12px)',
					paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
				}}
				role="banner"
				aria-label="Mobile navigation"
			>
				<div className="flex w-full min-w-0 items-center justify-between gap-2 min-[375px]:gap-3">
					{/* ── Left: brand orb (home) or back orb (detail) ── */}
					{pathname === '/' ? (
						/* Home → logo + Spicy TV text */
						<LiquidGlass
							strength={scrolled ? 'protective' : 'regular'}
							className="h-12 w-12 rounded-full"
						>
							<Link
								href="/"
								className={cn(
									'flex h-12 w-12 items-center justify-center rounded-full touch-manipulation select-none',
									'active:scale-[0.94] transition-transform duration-200 ease-out',
									headerFocus
								)}
								aria-label="Go to home page"
							>
								<img src="/logo.webp" alt="" className="h-8 w-8 object-contain" />
							</Link>
						</LiquidGlass>
					) : (
						/* Inner pages → back + home */
						<LiquidGlass
							strength={scrolled ? 'protective' : 'regular'}
							className="h-12 rounded-full px-0.5"
						>
							<div className="flex h-12 items-center">
								<button
									onClick={() => window.history.back()}
									className={mobileAction}
									aria-label="Go back"
								>
									<CaretLeft size={20} weight="bold" />
								</button>
								<Link
									href="/"
									className={mobileAction}
									aria-label="Go to home page"
								>
									<HouseIcon size={19} weight="fill" />
								</Link>
							</div>
						</LiquidGlass>
					)}

					{/* ── Right: actions pill (plain icons, no nested borders) ── */}
					<LiquidGlass
						strength={scrolled ? 'protective' : 'regular'}
						className="mr-2 h-12 shrink-0 rounded-full px-0.5"
					>
						<div className="flex h-12 items-center">
							{/* Search — plain icon, no individual background */}
							<SearchTrigger variant="icon" className={mobileAction} />

							{/* Profile — plain icon, no individual background */}
							<Link
								href={session?.user ? '/profile' : '/auth/signin'}
								className={mobileAction}
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
							<button
								onClick={toggleSidebar}
								className={mobileAction}
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
							</button>
						</div>
					</LiquidGlass>
				</div>
			</header>
		</>
	);
}
