'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Search, MenuSquare, User, Bookmark } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useSession } from '@/lib/auth-client';

interface MobileHeaderProps {
	center?: boolean;
}

interface MobileNavItem {
	id: 'home' | 'search' | 'explore' | 'library' | 'account';
	label: string;
	icon: React.ReactNode;
	href?: string;
	onClick?: () => void;
}

const buttonVariants = {
	initial: {
		gap: 0,
		paddingLeft: '.5rem',
		paddingRight: '.5rem',
	},
	animate: (isSelected: boolean) => ({
		gap: isSelected ? '.5rem' : 0,
		paddingLeft: isSelected ? '1rem' : '.5rem',
		paddingRight: isSelected ? '1rem' : '.5rem',
	}),
};

const labelVariants = {
	initial: { width: 0, opacity: 0 },
	animate: { width: 'auto', opacity: 1 },
	exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: 'spring', bounce: 0, duration: 0.35 };

interface TabButtonProps {
	label: string;
	icon: React.ReactNode;
	isSelected: boolean;
	onSelect: () => void;
}

function TabButton({ label, icon, isSelected, onSelect }: TabButtonProps) {
	return (
		<motion.button
			variants={buttonVariants}
			initial="initial"
			animate="animate"
			custom={isSelected}
			onClick={onSelect}
			transition={transition}
			className={cn(
				'relative flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300',
				'text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
				isSelected && 'bg-primary text-primary-foreground'
			)}
			aria-current={isSelected ? 'page' : undefined}
		>
			{icon}
			<AnimatePresence>
				{isSelected && (
					<motion.span
						variants={labelVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={transition}
						className="overflow-hidden"
					>
						{label}
					</motion.span>
				)}
			</AnimatePresence>
		</motion.button>
	);
}

export default function MobileHeader({ center }: MobileHeaderProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { toggleSidebar } = useSidebar();
	const { data: session } = useSession();

	const accountHref = session?.user?.id ? '/profile' : '/auth/signin?callbackUrl=/profile';
	const libraryHref = session?.user?.id ? '/library' : '/auth/signin?callbackUrl=/library';
	const libraryLabel = session?.user?.id ? 'Library' : 'Sign in first';

	const handleNavigate = React.useCallback(
		(href: string) => {
			router.push(href);
		},
		[router]
	);

	const navItems = React.useMemo<MobileNavItem[]>(() => {
		return [
			{ id: 'home', label: 'Home', icon: <Home className="h-4 w-4" />, href: '/' },
			{ id: 'search', label: 'Search', icon: <Search className="h-4 w-4" />, href: '/search' },
			{ id: 'explore', label: 'Explore', icon: <MenuSquare className="h-4 w-4" />, onClick: toggleSidebar },
			{ id: 'library', label: libraryLabel, icon: <Bookmark className="h-4 w-4" />, href: libraryHref },
			{ id: 'account', label: 'Profile', icon: <User className="h-4 w-4" />, href: accountHref },
		];
	}, [toggleSidebar, libraryLabel, libraryHref, accountHref]);

	const selectedId = React.useMemo<MobileNavItem['id']>(() => {
		if (pathname === '/') return 'home';
		if (pathname.startsWith('/search')) return 'search';
		if (pathname.startsWith('/library')) return 'library';
		if (pathname.startsWith('/profile')) return 'account';
		return 'home';
	}, [pathname]);

	const handleSelect = React.useCallback(
		(item: MobileNavItem) => {
			if (item.onClick) item.onClick();
			if (item.href) handleNavigate(item.href);
		},
		[handleNavigate]
	);

	return (
		<nav
			className={cn(
				'fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-2',
				center && 'justify-center'
			)}
			aria-label="Bottom navigation"
		>
			<div className="mb-6 flex w-fit flex-wrap items-center rounded-full bg-background/90 p-2 backdrop-blur-md border border-border/50">
				{navItems.map((navItem) => (
					<TabButton
						key={navItem.id}
						label={navItem.label}
						icon={navItem.icon}
						isSelected={selectedId === navItem.id}
						onSelect={() => handleSelect(navItem)}
					/>
				))}
			</div>
		</nav>
	);
}
