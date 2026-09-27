'use client';

import * as React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/ui/wordmark';
import { usePathname, useRouter } from 'next/navigation';
import { CaretLeft } from '@phosphor-icons/react';
import { SearchTrigger } from '@/components/features/search/search-trigger';
import { useSidebar } from '@/components/ui/sidebar';
import { HeaderNavigation } from './header-navigation';
import { navigationItems } from './navigation-data';
import { AuthButton } from '@/components/auth/auth-button';
import { cn } from '@/lib/utils';
import { useEpisodeStore } from '@/store/episodeStore';

interface HeaderProps {
	className?: string;
}

export function Header({ className }: HeaderProps) {
	const [scrolled, setScrolled] = React.useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const { toggleSidebar, openMobile, open, isMobile } = useSidebar();
	const sidebarOpen = isMobile ? openMobile : open;
	const isPlayerSticky = useEpisodeStore((state) => state.isPlayerSticky);

	React.useEffect(() => {
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setScrolled(window.scrollY > 24);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleBack = React.useCallback(() => {
		if (
			typeof window !== 'undefined' &&
			window.history.length > 1 &&
			document.referrer &&
			new URL(document.referrer, window.location.href).origin === window.location.origin
		) {
			router.back();
		} else {
			router.push('/');
		}
	}, [router]);

	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href);

	const isHome = pathname === '/';

	return (
		<header
			className={cn(
				'fixed top-0 left-0 right-0 z-50 w-full',
				isPlayerSticky && 'absolute',
				className
			)}
			role="banner"
			aria-label="Main navigation"
		>
			<div
				className={cn(
					'absolute inset-0 transition-opacity duration-250 ease-out',
					scrolled
						? 'border-b border-border bg-background/84 backdrop-blur-md backdrop-saturate-140 opacity-100'
						: 'border-b border-transparent bg-transparent opacity-0 pointer-events-none'
				)}
			/>
			<div className="relative mx-auto flex h-16 w-full items-center justify-between px-gutter">
				<div className="flex items-center gap-1 sm:gap-2">
					{!isHome && (
						<button
							type="button"
							onClick={handleBack}
							className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors can-hover:bg-foreground/10 can-hover:text-foreground active:scale-97 motion-reduce:active:scale-100 lg:hidden"
							aria-label="Go back"
						>
							<CaretLeft size={20} weight="bold" />
						</button>
					)}
					<Link
						href="/"
						prefetch={false}
						className={cn(
							'group flex h-11 items-center gap-1.5 rounded-md px-1',
							'transition-transform duration-150 active:scale-97 motion-reduce:active:scale-100',
							'touch-manipulation'
						)}
						aria-label="Spicy TV home"
					>
						<Wordmark />
					</Link>
				</div>

				<nav
					className="hidden lg:flex items-center justify-center"
					aria-label="Primary"
				>
					<HeaderNavigation items={navigationItems} isActive={isActive} />
				</nav>

				<div className="flex items-center gap-0.5 sm:gap-1">
					<SearchTrigger
						variant="icon"
						className="h-11 w-11 rounded-full text-foreground/70 can-hover:bg-foreground/[0.08] can-hover:text-foreground active:scale-97 motion-reduce:active:scale-100"
					/>
					<div className="hidden sm:flex items-center">
						<AuthButton />
					</div>
					<button
						type="button"
						onClick={toggleSidebar}
						className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors can-hover:bg-foreground/10 can-hover:text-foreground active:scale-97 motion-reduce:active:scale-100 lg:hidden"
						aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={sidebarOpen}
					>
						<div className="relative flex h-5 w-5 items-center justify-center">
							{sidebarOpen ? (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2.2}
									strokeLinecap="round"
									className="h-5 w-5"
								>
									<line x1="5" y1="5" x2="19" y2="19" />
									<line x1="19" y1="5" x2="5" y2="19" />
								</svg>
							) : (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									className="h-5 w-5"
								>
									<line x1="4" y1="7" x2="20" y2="7" />
									<line x1="4" y1="12" x2="20" y2="12" />
									<line x1="4" y1="17" x2="20" y2="17" />
								</svg>
							)}
						</div>
					</button>
				</div>
			</div>
		</header>
	);
}
