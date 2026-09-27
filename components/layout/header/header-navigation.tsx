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
		<ul className="relative flex items-center gap-0.5 sm:gap-1">
			{items.map((item) => {
				const active = isActive(item.href);

				return (
					<li key={item.href} className="relative">
						<Link
							href={item.href}
							prefetch={false}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'relative flex h-9 items-center rounded-full px-2.5 sm:px-3.5',
								'text-ui font-medium tracking-normal',
								'transition-colors duration-200 ease-out active:scale-97 motion-reduce:active:scale-100',
								'select-none',
								active
									? 'text-foreground'
									: 'text-dim can-hover:text-foreground'
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
