import Link from 'next/link';
import { FilmIcon, TvIcon, CatIcon } from 'lucide-react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SearchCommandBox } from '@/components/container/home-container/search-command-box';
import ThemeButton from '../ThemeButton';
import CommonContainer from '@/components/container/CommonContainer';

const categories = [
	{ title: 'Movies', href: '/movie', Icon: FilmIcon },
	{ title: 'TV', href: '/tv', Icon: TvIcon },
	{ title: 'Anime', href: '/anime', Icon: CatIcon },
];

type HeaderProps = {
	pathname: string;
};

export const Header = () => {
	const isActive = (href: string) => false;

	return (
		<CommonContainer>
			<nav
				className="flex justify-between items-center py-4"
				role="navigation"
				aria-label="Main navigation"
			>
				<Link href="/" className="relative z-40 flex items-center gap-2 h-12">
					<img
						src="/logo.webp"
						alt="App logo"
						className="w-10 h-10"
						width={40}
						height={40}
					/>
				</Link>

				<ul className="flex gap-4 items-center text-sm font-medium">
					{categories.map(({ title, href, Icon }) => {
						const active = isActive(href);
						return (
							<li key={href}>
								<Link href={href} className="relative px-1 py-2">
									<div
										className={`flex items-center gap-2 border-b-2 ${
											active
												? 'border-primary text-primary'
												: 'border-transparent'
										}`}
									>
										<Icon className="w-4 h-4" />
										<span>{title}</span>
									</div>
								</Link>
							</li>
						);
					})}
				</ul>

				<div className="flex items-center gap-3">
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
