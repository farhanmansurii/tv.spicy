'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavigationItem } from './navigation-data';

interface HeaderNavigationProps {
	items: NavigationItem[];
	isActive: (href: string) => boolean;
}

export function HeaderNavigation({ items, isActive }: HeaderNavigationProps) {
	return (
		<ul className="flex items-center gap-0.5">
			{items.map((item) => {
				const active = isActive(item.href);

				return (
					<li key={item.href}>
						<Link
							href={item.href}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'relative flex items-center px-3.5 py-1.5 rounded-full',
								'text-[13px] font-medium tracking-tight',
								'transition-all duration-200 ease-out',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
								'select-none touch-manipulation',
								active
									? 'text-white bg-white/10'
									: 'text-white/50 hover:text-white/85 hover:bg-white/[0.05]'
							)}
						>
							{item.label}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
