/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { CatIcon, FilmIcon, SearchIcon, TvIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HomeSearchContainer from '@/components/container/home-container/homepage-search-container';
import { SearchCommandBox } from '@/components/container/home-container/search-command-box';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import ThemeButton from '../ThemeButton';

const categories = [
	{
		title: 'Movies',
		href: '/movie',
		icon: <FilmIcon />,
	},
	{
		title: 'TV',
		href: '/tv',
		icon: <TvIcon />,
	},
	{
		title: 'Anime',
		href: '/anime',
		icon: <CatIcon />,
	},
];

export const Header = () => {
	const pathname = usePathname();
	const isActiveRoute = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};
	return (
		<div className="mx-auto max-w-3xl  px-4 lg:px-0">
			<div className="flex gap-4 items-center justify-between flex-row my-3 z-30">
				<Link
					key={'/'}
					className="cursor-pointer w-fit whitespace-nowrap z-40 relative"
					href={'/'}
				>
					<motion.div
						className={`flex items-center gap-2 h-12`}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					>
						<img className="w-10 h-10" alt="" src="/logo.webp" />
					</motion.div>
				</Link>
				<div className="w-fit items-center  gap-4 flex">
					{categories.map((el) => (
						<Link key={el.href} className="cursor-pointer z-40 relative" href={el.href}>
							<motion.div
								className={`flex items-center gap-2 h-12 border-b-2  px-1  ${
									isActiveRoute(el.href) ? 'text-primary' : ' border-transparent'
								}`}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							>
								<span className="">{el.title}</span>
								{isActiveRoute(el.href) && (
									<motion.div
										className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
										layoutId="underline"
										initial={false}
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									/>
								)}
							</motion.div>
						</Link>
					))}
					<ThemeButton />
					<SearchCommandBox searchType={isActiveRoute('/anime') ? 'anime' : 'tvshow'}>
						<div className="bg-primary p-2 rounded-full hover:scale-95 duration-150 hover:bg-primary/80">
							<MagnifyingGlassIcon className="w-5 h-5 text-background" />
						</div>
					</SearchCommandBox>
				</div>
			</div>
		</div>
	);
};
