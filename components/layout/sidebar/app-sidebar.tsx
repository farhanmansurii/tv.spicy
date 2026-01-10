'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	useSidebar,
} from '@/components/ui/sidebar';

import { SearchCommandBox } from '@/components/features/search/search-command-box';
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
						onClick={handleLinkClick}
						className={cn(
							'flex items-center gap-3',
							'rounded-xl px-2 py-2 -ml-2',
							'transition-all duration-200',
							'hover:bg-foreground/[0.03] active:bg-foreground/[0.05]'
						)}
					>
						<div className="relative h-10 w-10 flex-shrink-0">
							<Image
								src="/logo.webp"
								alt="Spicy TV"
								fill
								className="object-contain"
								priority
								sizes="40px"
							/>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-[17px] font-semibold tracking-[-0.41px] leading-tight text-foreground">
								Spicy TV
							</span>
							<span className="text-[12px] text-muted-foreground/70 leading-tight">
								Streaming Platform
							</span>
						</div>
					</Link>

					<button
						onClick={() => setOpenMobile(false)}
						className={cn(
							'flex h-9 w-9 items-center justify-center rounded-full',
							'bg-foreground/[0.05] hover:bg-foreground/[0.08] active:bg-foreground/[0.1]',
							'text-foreground/60 hover:text-foreground',
							'transition-all duration-200',
							'touch-manipulation'
						)}
						aria-label="Close menu"
					>
						<X className="h-4 w-4" strokeWidth={2} />
					</button>
				</div>
			</SidebarHeader>

			<div className="px-4 pb-4">
				<SearchCommandBox variant="expanded" />
			</div>

			<div className="mx-4 h-px bg-border/50" />
			<SidebarContent className="custom-scrollbar px-3 py-4">
				<nav className="space-y-1">
					{navigationItems.map((item) => {
						const itemIsActive = isActive(item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={handleLinkClick}
								className={cn(
									'group flex items-center gap-3 px-3 py-3 rounded-xl',
									'text-[15px] font-medium',
									'transition-all duration-200 ease-out',
									'touch-manipulation',
									itemIsActive
										? 'bg-foreground/[0.06] text-foreground'
										: 'text-foreground/80 hover:bg-foreground/[0.03] hover:text-foreground'
								)}
							>
								<span>{item.label}</span>
								{itemIsActive && (
									<motion.div
										layoutId="activeSidebarIndicator"
										className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/60"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									/>
								)}
							</Link>
						);
					})}
				</nav>
			</SidebarContent>

			<SidebarFooter className="px-4 py-4 border-t border-border/30">
				<div className="flex items-center justify-between">
					<span className="text-[12px] text-muted-foreground/50 font-medium uppercase tracking-wider">
						Account
					</span>
					<AuthButton />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
