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
		<ul className="relative flex items-center gap-7">
			{items.map((item) => {
				const active = isActive(item.href);

				return (
					<li key={item.href} className="relative">
						<Link
							href={item.href}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'relative flex h-11 items-center rounded-md px-0.5',
								'text-[13px] font-medium tracking-[-0.01em]',
								'transition-colors duration-200 ease-out',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
								'select-none',
								active ? 'text-white' : 'text-white/55 hover:text-white/90'
							)}
						>
							{item.label}
							<span
								aria-hidden="true"
								className={cn(
									'absolute inset-x-0 bottom-1.5 mx-auto h-[2px] w-4 rounded-full bg-white transition-opacity duration-200',
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
