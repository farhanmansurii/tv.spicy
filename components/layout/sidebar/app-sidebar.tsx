'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	useSidebar,
} from '@/components/ui/sidebar';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchCommandBox } from '@/components/features/search/search-command-box';
import { navigationItems } from '../header/navigation-data';
import { cn } from '@/lib/utils';
import { AuthButton } from '@/components/auth/auth-button';

/**
 * AppSidebar - Apple-inspired mobile navigation sidebar
 *
 * Features:
 * - Frosted glass aesthetic
 * - Smooth spring animations
 * - Refined touch interactions
 * - Hierarchical navigation with collapsible sections
 * - Active state indicators
 */
export function AppSidebar() {
	const { setOpenMobile } = useSidebar();
	const [openSections, setOpenSections] = React.useState<Set<string>>(new Set());
	const pathname = usePathname();

	// Auto-expand sections if current path matches
	React.useEffect(() => {
		const newOpenSections = new Set<string>();
		navigationItems.forEach((item) => {
			if (item.items && pathname.startsWith(item.href)) {
				newOpenSections.add(item.href);
			}
		});
		setOpenSections(newOpenSections);
	}, [pathname]);

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	const handleLinkClick = () => {
		setOpenMobile(false);
	};

	const toggleSection = (href: string) => {
		setOpenSections((prev) => {
			const next = new Set(prev);
			if (next.has(href)) {
				next.delete(href);
			} else {
				next.add(href);
			}
			return next;
		});
	};

	return (
		<Sidebar
			variant="floating"
			side="right"
			collapsible="offcanvas"
			className="lg:hidden"
			style={{
				'--sidebar-width': '85vw',
			} as React.CSSProperties}
		>
			{/* Header with Logo and Close */}
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
								alt="Watvh TV"
								fill
								className="object-contain"
								priority
								sizes="40px"
							/>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-[17px] font-semibold tracking-[-0.41px] leading-tight text-foreground">
								Watvh TV
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

			{/* Search Section */}
			<div className="px-4 pb-4">
				<SearchCommandBox variant="expanded" />
			</div>

			{/* Divider */}
			<div className="mx-4 h-px bg-border/50" />

			{/* Navigation Content */}
			<SidebarContent className="custom-scrollbar px-3 py-4">
				<nav className="space-y-1">
					{navigationItems.map((item) => {
						const hasSubItems = item.items && item.items.length > 0;
						const isSectionOpen = openSections.has(item.href);
						const itemIsActive = isActive(item.href);

						if (hasSubItems) {
							return (
								<Collapsible
									key={item.href}
									open={isSectionOpen}
									onOpenChange={() => toggleSection(item.href)}
								>
									<CollapsibleTrigger asChild>
										<button
											className={cn(
												'group flex w-full items-center justify-between gap-3 px-3 py-3 rounded-xl',
												'text-[15px] font-medium',
												'transition-all duration-200 ease-out',
												'touch-manipulation',
												itemIsActive
													? 'bg-foreground/[0.06] text-foreground'
													: 'text-foreground/80 hover:bg-foreground/[0.03] hover:text-foreground'
											)}
										>
											<div className="flex items-center gap-3">
												<div
													className={cn(
														'flex h-9 w-9 items-center justify-center rounded-xl',
														'transition-all duration-200',
														itemIsActive
															? 'bg-foreground/[0.08]'
															: 'bg-foreground/[0.03] group-hover:bg-foreground/[0.06]'
													)}
												>
													<item.icon
														className={cn(
															'h-[18px] w-[18px]',
															itemIsActive
																? 'text-foreground'
																: 'text-muted-foreground group-hover:text-foreground'
														)}
													/>
												</div>
												<span>{item.label}</span>
											</div>
											<ChevronRight
												className={cn(
													'h-4 w-4 text-muted-foreground/50 transition-transform duration-300',
													isSectionOpen && 'rotate-90'
												)}
											/>
										</button>
									</CollapsibleTrigger>

									<CollapsibleContent>
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="mt-1 ml-3 pl-6 border-l border-border/30 space-y-0.5"
										>
											{item.items?.map((subItem) => {
												const subIsActive = isActive(subItem.href);
												return (
													<Link
														key={subItem.href}
														href={subItem.href}
														onClick={handleLinkClick}
														className={cn(
															'group/sub flex items-center gap-3 px-3 py-2.5 rounded-xl',
															'transition-all duration-200',
															'touch-manipulation',
															subIsActive
																? 'bg-foreground/[0.06] text-foreground'
																: 'text-foreground/70 hover:bg-foreground/[0.03] hover:text-foreground'
														)}
													>
														<div
															className={cn(
																'flex h-7 w-7 items-center justify-center rounded-lg',
																'transition-all duration-200',
																subIsActive
																	? 'bg-foreground/[0.08]'
																	: 'bg-foreground/[0.02] group-hover/sub:bg-foreground/[0.05]'
															)}
														>
															<subItem.icon
																className={cn(
																	'h-3.5 w-3.5',
																	subIsActive
																		? 'text-foreground'
																		: 'text-muted-foreground group-hover/sub:text-foreground'
																)}
															/>
														</div>
														<div className="flex flex-col gap-0.5 min-w-0">
															<span className="text-[14px] font-medium leading-tight truncate">
																{subItem.label}
															</span>
															{subItem.description && (
																<span className="text-[12px] text-muted-foreground/60 leading-tight line-clamp-1">
																	{subItem.description}
																</span>
															)}
														</div>
													</Link>
												);
											})}
										</motion.div>
									</CollapsibleContent>
								</Collapsible>
							);
						}

						// Simple navigation item without sub-items
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
								<div
									className={cn(
										'flex h-9 w-9 items-center justify-center rounded-xl',
										'transition-all duration-200',
										itemIsActive
											? 'bg-foreground/[0.08]'
											: 'bg-foreground/[0.03] group-hover:bg-foreground/[0.06]'
									)}
								>
									<item.icon
										className={cn(
											'h-[18px] w-[18px]',
											itemIsActive
												? 'text-foreground'
												: 'text-muted-foreground group-hover:text-foreground'
										)}
									/>
								</div>
								<span>{item.label}</span>

								{/* Active indicator */}
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

			{/* Footer with Auth */}
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
