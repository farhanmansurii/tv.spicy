'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
	label: string;
	href: string;
}

interface BreadcrumbsProps {
	showName?: string;
	showType?: 'tv' | 'movie';
	className?: string;
}

export function Breadcrumbs({ showName, showType, className }: BreadcrumbsProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [dynamicShowName, setDynamicShowName] = useState<string | null>(null);
	const pathSegments = pathname.split('/').filter(Boolean);

	useEffect(() => {
		if (!showName && (pathSegments[0] === 'tv' || pathSegments[0] === 'movie') && pathSegments[1]) {
			const title = document.title;
			if (title && title !== 'SpicyTV') {
				const titleParts = title.split('|');
				if (titleParts[0]) {
					setDynamicShowName(titleParts[0].trim());
				}
			}
		}
	}, [pathname, showName, pathSegments]);

	if (pathname === '/' || pathSegments.length === 0) {
		return null;
	}

	const items: BreadcrumbItem[] = [
		{ label: 'Home', href: '/' },
	];

	if (pathSegments[0] === 'tv' || pathSegments[0] === 'movie') {
		const typeLabel = pathSegments[0] === 'tv' ? 'TV Shows' : 'Movies';
		items.push({
			label: typeLabel,
			href: `/${pathSegments[0]}`,
		});

		const finalShowName = showName || dynamicShowName;
		if (finalShowName && pathSegments[1]) {
			items.push({
				label: finalShowName,
				href: pathname,
			});
		}
	} else if (pathSegments[0] === 'genres') {
		items.push({
			label: 'Genres',
			href: '/genres',
		});
	} else if (pathSegments[0] === 'search') {
		items.push({
			label: 'Search',
			href: '/search',
		});
		const query = searchParams.get('q');
		if (query) {
			items.push({
				label: `"${query}"`,
				href: pathname,
			});
		}
	} else if (pathSegments[0] === 'browse') {
		items.push({
			label: 'Browse',
			href: '/browse',
		});
		if (pathSegments[1]) {
			items.push({
				label: pathSegments[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
				href: pathname,
			});
		}
	}

	if (items.length <= 1) {
		return null;
	}

	return (
		<nav
			aria-label="Breadcrumb"
			className={cn(
				'flex items-center gap-1.5',
				className
			)}
		>
			<ol className="flex items-center gap-1.5 flex-wrap">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					const isHome = item.label === 'Home';

					return (
						<li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
							{isLast ? (
								<span
									className={cn(
										'px-3 py-1 rounded-full text-xs font-medium',
										'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg',
										'text-white truncate max-w-[200px] md:max-w-[250px]'
									)}
									aria-current="page"
								>
									{item.label}
								</span>
							) : (
								<Link
									href={item.href}
									className={cn(
										'px-3 py-1 rounded-full text-xs font-medium transition-all',
										'bg-white/15 backdrop-blur-md border border-white/20',
										'text-white hover:text-white hover:bg-white/25 hover:border-white/30',
										'truncate max-w-[150px] md:max-w-[200px]',
										'flex items-center gap-1.5 shadow-md'
									)}
								>
									{isHome && <Home className="w-3 h-3 flex-shrink-0" />}
									<span>{item.label}</span>
								</Link>
							)}
							{!isLast && (
								<ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
