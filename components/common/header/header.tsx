/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilmIcon, TvIcon, CatIcon } from 'lucide-react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SearchCommandBox } from '@/components/container/home-container/search-command-box';
import ThemeButton from '../ThemeButton';
import CommonContainer from '@/components/container/CommonContainer';

const categories = [
	{ title: 'Movies', href: '/movie', icon: <FilmIcon /> },
	{ title: 'TV', href: '/tv', icon: <TvIcon /> },
	{ title: 'Anime', href: '/anime', icon: <CatIcon /> },
];

export const Header = () => {
	const pathname = usePathname();

	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href);

	return (
		<CommonContainer>
			<nav
				className="flex justify-between items-center py-4"
				role="navigation"
				aria-label="Main navigation"
			>
				{/* Logo */}
				<Link href="/" className="relative z-40 flex items-center gap-2 h-12">
					<img src="/logo.webp" alt="App logo" className="w-10 h-10" />
				</Link>

				{/* Nav Links */}
				<ul className="flex gap-4 items-center text-sm font-medium">
					{categories.map(({ title, href, icon }) => (
						<li key={href}>
							<Link href={href} className="relative px-1 py-2">
								<div
									className={`flex items-center gap-2 border-b-2 ${
										isActive(href)
											? 'border-primary text-primary'
											: 'border-transparent'
									}`}
								>
									<span>{title}</span>
									{isActive(href) && (
										<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
									)}
								</div>
							</Link>
						</li>
					))}
				</ul>

				{/* Actions */}
				<div className="flex items-center gap-3">
					<ThemeButton />
					<SearchCommandBox searchType={isActive('/anime') ? 'anime' : 'tvshow'}>
						<button className="bg-primary text-background p-2 rounded-full hover:bg-primary/80 transition-transform hover:scale-95">
							<MagnifyingGlassIcon className="w-5 h-5" />
						</button>
					</SearchCommandBox>
				</div>
			</nav>
		</CommonContainer>
	);
};
