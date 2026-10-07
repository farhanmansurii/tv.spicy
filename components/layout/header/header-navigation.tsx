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
								'relative flex h-9 items-center rounded-full px-3',
								'text-ui font-medium',
								'transition-[color,transform] duration-(--duration-ui) ease-out active:scale-97 motion-reduce:active:scale-100',
								'select-none',
								active ? 'text-text' : 'text-dim can-hover:text-text'
							)}
						>
							{item.label}
							<span
								aria-hidden="true"
								className={cn(
									'absolute inset-x-3 -bottom-px h-px bg-brand transition-opacity duration-(--duration-ui) ease-out',
									active ? 'opacity-100' : 'opacity-0'
								)}
							/>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
