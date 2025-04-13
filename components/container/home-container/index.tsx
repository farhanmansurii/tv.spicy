/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { Suspense } from 'react';
import { Header } from '@/components/common/header';
import useTitle from '@/lib/use-title';
import RecentlyWatchedTV from '@/components/common/RecentlyWatched';
import WatchList from '@/components/common/WatchList';
import { SearchCommandBox } from './search-command-box';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MinimalSocialsFooter from '@/components/common/Footer';
import { Title } from '@/components/animated-common/Title';
import { title } from 'process';
import GenresPage from '../Genre';
import Link from 'next/link';

export default function HomeContainer() {
	const { title } = useTitle();
	return (
		title && (
			<div className="">
				<Header />
				<div className="mx-auto  max-w-3xl space-y-4 px-4 lg:px-0">
					<div className="px-2 pt-56">
						<Title className="relative z-20 text-[2rem] font-normal leading-none">
							<div className="overflow-hidden">
								<span className="block pb-2 font-semibold">{title}</span>
							</div>
						</Title>
					</div>
					<div className="flex flex-row py-3 px-2 items-center gap-3">
						Search for :
						<SearchCommandBox searchType="tvshow">
							<Button variant={'gooeyLeft'} size={'sm'}>
								TV Show / Movies
							</Button>
						</SearchCommandBox>
						<Link href={'https://spicy-anime.vercel.app/'}>
							<Button variant={'gooeyRight'} size={'sm'}>
								Anime
							</Button>
						</Link>
					</div>
					<Separator className="my-5" />
					<div className=" w-full">
						<div className=" space-y-4 w-full">
							<RecentlyWatchedTV />
							<WatchList type="movie" />
							<WatchList type="tv" />
						</div>
					</div>
					<Suspense>
						<GenresPage />
					</Suspense>
				</div>
				<MinimalSocialsFooter />
			</div>
		)
	);
}
