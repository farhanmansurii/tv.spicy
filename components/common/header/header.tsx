'use client';

import Link from 'next/link';
import { SearchCommandBox } from '@/components/container/home-container/search-command-box';
import ThemeButton from '../ThemeButton';
import CommonContainer from '@/components/container/CommonContainer';

const categories = [
	{ title: 'Movies', href: '/movie' },
	{ title: 'TV', href: '/tv' },
	{ title: 'Anime', href: '/anime' },
];

export const Header = () => {
	const isActive = (href: string) => false; // implement your active route logic

	return (
		<CommonContainer>
			<nav
				className="flex items-center justify-between py-4"
				role="navigation"
				aria-label="Main navigation"
			>
				{/* Left section: logo + nav */}
				<div className="flex items-center gap-8">
					<Link href="/" className="flex items-center h-10">
						<img
							src="/logo.webp"
							alt="App logo"
							className="w-10 h-10"
							width={40}
							height={40}
						/>
					</Link>
				</div>

				{/* Right section: search + theme toggle */}
				<div className="flex items-center gap-3">
					<ul className="flex gap-5 text-sm font-medium text-muted-foreground">
						{categories.map(({ title, href }) => {
							const active = isActive(href);
							return (
								<li key={href}>
									<Link
										href={href}
										className={`transition-colors hover:text-foreground ${
											active ? 'text-foreground font-semibold' : ''
										}`}
									>
										{title}
									</Link>
								</li>
							);
						})}
					</ul>
					<Link
						href="/search"
						className="text-sm px-3 py-1 border border-border hover:border-foreground transition-colors"
					>
						Search
					</Link>
				</div>
			</nav>
		</CommonContainer>
	);
};
