'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu } from 'lucide-react';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { HeaderActions } from './header-actions';
import { HeaderNavigation } from './header-navigation';
import { navigationItems } from './navigation-data';
import { Button } from '@/components/ui/button';

interface HeaderProps {
	className?: string;
}

/**
 * Header Component - Apple Human Interface Guidelines Compliant
 *
 * Design Principles:
 * - 44pt minimum touch targets (Apple HIG)
 * - SF Pro typography scale
 * - Material blur effects (backdrop-blur)
 * - Smooth transitions (300ms ease-out)
 * - Proper semantic HTML
 * - Accessibility first
 * - Desktop: Inline navigation (no sidebar)
 * - Mobile: Sidebar navigation
 */
export function Header({ className }: HeaderProps) {
	const [scrolled, setScrolled] = React.useState(false);
	const pathname = usePathname();
	const { toggleSidebar } = useSidebar();

	// Apple-style scroll detection with passive listener
	React.useEffect(() => {
		const handleScroll = () => {
			// Apple uses ~20px threshold for header state changes
			setScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<header
			className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${
				scrolled
					? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
					: 'bg-background/60 backdrop-blur-md border-b border-transparent'
			} ${className || ''}`}
			role="banner"
			aria-label="Main navigation"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Left: Logo */}
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl px-2 py-1.5 -ml-2 transition-all duration-200 hover:opacity-80 active:opacity-70 touch-manipulation"
							aria-label="Go to home page"
						>
							<div className="relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
								<Image
									src="/logo.webp"
									alt="Watvh TV"
									fill
									className="object-contain"
									priority
									sizes="(max-width: 640px) 36px, 40px"
								/>
							</div>
							<span className="hidden sm:inline-block text-[17px] font-semibold tracking-[-0.41px] text-foreground">
								Watvh TV
							</span>
						</Link>
					</div>

					{/* Center: Desktop Navigation - Hidden on mobile */}
					<nav className="hidden lg:flex items-center" aria-label="Main navigation">
						<HeaderNavigation items={navigationItems} isActive={isActive} />
					</nav>

					{/* Right: Actions + Mobile Sidebar Trigger */}
					<div className="flex items-center gap-2 sm:gap-3">
						<HeaderActions />

						{/* Mobile only - Sidebar trigger on the right with Menu icon */}
						<div className="lg:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebar}
								className="h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-accent active:bg-accent/80 transition-colors duration-200 touch-manipulation"
								aria-label="Toggle navigation menu"
							>
								<Menu className="h-5 w-5 text-foreground" strokeWidth={2} />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
