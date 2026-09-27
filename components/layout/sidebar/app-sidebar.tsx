'use client';

import * as React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/ui/wordmark';
import { usePathname } from 'next/navigation';
import { XIcon } from '@phosphor-icons/react';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	useSidebar,
} from '@/components/ui/sidebar';

import { SearchTrigger } from '@/components/features/search/search-trigger';
import { navigationItems } from '../header/navigation-data';
import { cn } from '@/lib/utils';
import { AuthButton } from '@/components/auth/auth-button';


export function AppSidebar() {
	const { setOpenMobile } = useSidebar();
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	const handleLinkClick = () => {
		setOpenMobile(false);
	};

	return (
		<Sidebar
			variant="floating"
			side="right"
			collapsible="offcanvas"
			className="lg:hidden"
			style={
				{
					'--sidebar-width': '85vw',
				} as React.CSSProperties
			}
		>
			<SidebarHeader className="px-4 pt-4 pb-3">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						prefetch={false}
						onClick={handleLinkClick}
						aria-label="Spicy TV home"
						className="-ml-1 flex h-11 items-center rounded-md px-1 transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100"
					>
						<Wordmark />
					</Link>

					<button
						onClick={() => setOpenMobile(false)}
						className={cn(
							'flex h-9 w-9 items-center justify-center rounded-full',
							'bg-foreground/[0.05] can-hover:bg-foreground/[0.08] active:bg-foreground/[0.1]',
							'text-foreground/60 can-hover:text-foreground',
							'transition-[color,background-color,border-color,transform] duration-(--duration-ui)',
							'touch-manipulation'
						)}
						aria-label="Close menu"
					>
						<XIcon size={16} weight="bold" />
					</button>
				</div>
			</SidebarHeader>

			<div className="px-4 pb-4">
				<SearchTrigger variant="expanded" />
			</div>

			<div className="mx-4 h-px bg-border/50" />
			<SidebarContent className="px-3 py-4">
				<nav className="flex flex-col gap-1">
					{navigationItems.map((item) => {
						const itemIsActive = isActive(item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								prefetch={false}
								onClick={handleLinkClick}
								className={cn(
									'group flex items-center gap-3 px-3 py-3 rounded-sm',
									'text-title font-medium',
									'transition-[color,background-color,border-color,transform] duration-(--duration-ui) ease-out',
									'touch-manipulation',
									itemIsActive
										? 'bg-foreground/[0.06] text-foreground'
										: 'text-foreground/80 can-hover:bg-foreground/[0.03] can-hover:text-foreground'
								)}
							>
								<span>{item.label}</span>
								{itemIsActive && (
									<span
										aria-hidden="true"
										className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/60"
									/>
								)}
							</Link>
						);
					})}
				</nav>
			</SidebarContent>

			<div className="border-t border-border/30">
				<SidebarFooter className="px-4 py-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-caption uppercase tracking-label text-dim">
							Account
						</span>
						<AuthButton />
					</div>
				</SidebarFooter>
			</div>
		</Sidebar>
	);
}
