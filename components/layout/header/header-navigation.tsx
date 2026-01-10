'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NavigationItem } from './navigation-data';

interface HeaderNavigationProps {
	items: NavigationItem[];
	isActive: (href: string) => boolean;
}

/**
 * HeaderNavigation - Apple-inspired navigation with elegant dropdowns
 *
 * Features:
 * - Pill-shaped navigation items with subtle backgrounds
 * - Frosted glass dropdown menus
 * - Smooth spring animations
 * - Icon + label + description hierarchy
 * - Active state indicators
 */
export function HeaderNavigation({ items, isActive }: HeaderNavigationProps) {

	return (
		<ul className="flex items-center gap-0.5">
			{items.map((item) => {
				const itemIsActive = isActive(item.href);

				return (
					<li key={item.href} className="relative">
						<Link
							href={item.href}
							className={cn(
								'group relative flex items-center gap-2 px-4 py-2 rounded-full',
								'text-[14px] font-medium tracking-[-0.01em]',
								'transition-all duration-300 ease-out',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
								'touch-manipulation select-none',
								itemIsActive
									? 'text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
							aria-current={itemIsActive ? 'page' : undefined}
						>
							{/* Background highlight */}
							<span
								className={cn(
									'absolute inset-0 rounded-full transition-all duration-300',
									itemIsActive
										? 'bg-foreground/[0.06]'
										: 'bg-transparent group-hover:bg-foreground/[0.04]'
								)}
							/>

							{/* Content */}
							<span className="relative flex items-center gap-2">
								<span className="relative">{item.label}</span>
							</span>

							{/* Active indicator dot */}
							{itemIsActive && (
								<motion.span
									layoutId="activeNavIndicator"
									className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/60"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', stiffness: 500, damping: 30 }}
								/>
							)}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
