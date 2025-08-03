'use client';
import Link from 'next/link';
import { Equal, Search, SearchIcon, X } from 'lucide-react';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CommonContainer from '@/components/container/CommonContainer';
import { Input } from '@/components/ui/input';
import { SearchCommandBox } from '@/components/container/SearchCommandBox';

const menuItems = [
	{ name: 'TV Shows', href: '/tv' },
	{ name: 'Movies', href: '/movie' },
	// { name: 'User', href: '/profile' },
];

export const Header = () => {
	const [menuState, setMenuState] = React.useState(false);
	return (
		<header>
			<nav data-state={menuState && 'active'} className=" left-0 w-full z-20 px-2">
				<CommonContainer className={cn('mx-auto mt-2   transition-all duration-300 px-2 ')}>
					<div className="relative flex lg:flex-wrap items-center justify-between gap-6 lg:gap-0 py-2">
						<div className="flex w-full justify-between lg:w-auto">
							<Link href="/" aria-label="home" className="flex gap-2 items-center">
								<img src={'/logo.webp'} alt="logo" className="w-10 h-10" />
								<p className="font-semibold text-xl tracking-tighter">
									Spicy<span className="text-indigo-800">TV</span>
								</p>
							</Link>
						</div>

						<div className="absolute inset-0 m-auto  size-fit ">
							<ul className=" hidden lg:flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											className="text-muted-foreground hover:text-accent-foreground block duration-150"
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
						<SearchCommandBox />
					</div>
				</CommonContainer>
			</nav>
		</header>
	);
};
