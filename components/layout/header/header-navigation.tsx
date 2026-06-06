'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NavigationItem } from './navigation-data';

interface HeaderNavigationProps {
	items: NavigationItem[];
	isActive: (href: string) => boolean;
}

export function HeaderNavigation({ items, isActive }: HeaderNavigationProps) {
	return (
		<ul className="relative flex items-center gap-1 rounded-full bg-white/[0.04] p-1 border border-white/[0.06]">
			{items.map((item) => {
				const active = isActive(item.href);

				return (
					<li key={item.href} className="relative">
						<Link
							href={item.href}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'relative z-10 flex items-center px-4 py-1.5 rounded-full',
								'text-[13px] font-medium tracking-tight',
								'transition-colors duration-200 ease-out',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
								'select-none',
								active ? 'text-white' : 'text-white/45 hover:text-white/80'
							)}
						>
							{item.label}
						</Link>
						{active && (
							<motion.div
								layoutId="headerNavIndicator"
								className="absolute inset-0 rounded-full bg-white/10 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
								transition={{ type: 'spring', stiffness: 400, damping: 30 }}
							/>
						)}
					</li>
				);
			})}
		</ul>
	);
}
