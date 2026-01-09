'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { NavigationItem } from './navigation-data';

interface HeaderNavigationProps {
	items: NavigationItem[];
	isActive: (href: string) => boolean;
}

/**
 * HeaderNavigation - Apple-inspired navigation with elegant dropdowns
 *
 * Features:
 * - Pill-shaped navigation items with subtle backgrounds
 * - Frosted glass dropdown menus
 * - Smooth spring animations
 * - Icon + label + description hierarchy
 * - Active state indicators
 */
export function HeaderNavigation({ items, isActive }: HeaderNavigationProps) {
	const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

	return (
		<ul className="flex items-center gap-0.5">
			{items.map((item) => {
				const hasSubItems = item.items && item.items.length > 0;
				const itemIsActive = isActive(item.href);
				const isOpen = openDropdown === item.href;

				if (hasSubItems) {
					return (
						<li key={item.href} className="relative">
							<DropdownMenu
								open={isOpen}
								onOpenChange={(open) => setOpenDropdown(open ? item.href : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										className={cn(
											'group relative flex items-center gap-2 px-4 py-2 rounded-full',
											'text-[14px] font-medium tracking-[-0.01em]',
											'transition-all duration-300 ease-out',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
											'touch-manipulation select-none',
											itemIsActive || isOpen
												? 'text-foreground'
												: 'text-muted-foreground hover:text-foreground'
										)}
										aria-label={`${item.label} menu`}
										aria-expanded={isOpen}
									>
										{/* Background highlight */}
										<span
											className={cn(
												'absolute inset-0 rounded-full transition-all duration-300',
												itemIsActive || isOpen
													? 'bg-foreground/[0.06]'
													: 'bg-transparent group-hover:bg-foreground/[0.04]'
											)}
										/>

										{/* Content */}
										<span className="relative flex items-center gap-2">
											<item.icon
												className={cn(
													'h-4 w-4 transition-colors duration-300',
													itemIsActive || isOpen
														? 'text-foreground'
														: 'text-muted-foreground group-hover:text-foreground'
												)}
											/>
											<span className="relative">{item.label}</span>
											<ChevronDown
												className={cn(
													'h-3.5 w-3.5 transition-all duration-300',
													isOpen ? 'rotate-180' : '',
													itemIsActive || isOpen
														? 'text-foreground/70'
														: 'text-muted-foreground/70'
												)}
												strokeWidth={2}
											/>
										</span>
									</button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="center"
									sideOffset={8}
									className={cn(
										'w-72 p-2',
										'bg-popover/80 backdrop-blur-2xl backdrop-saturate-[1.8]',
										'border border-border/50',
										'shadow-[0_8px_30px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]',
										'rounded-2xl',
										'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
										'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
										'duration-200'
									)}
								>
									{/* Dropdown header */}
									<div className="px-3 py-2 mb-1">
										<p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">
											{item.label}
										</p>
									</div>

									{/* Dropdown items */}
									<div className="space-y-0.5">
										{item.items?.map((subItem) => (
											<DropdownMenuItem key={subItem.href} asChild>
												<Link
													href={subItem.href}
													className={cn(
														'group/item flex items-start gap-3 px-3 py-2.5 rounded-xl',
														'text-[14px] cursor-pointer',
														'transition-all duration-200 ease-out',
														'focus:outline-none',
														isActive(subItem.href)
															? 'bg-foreground/[0.08] text-foreground'
															: 'text-foreground/80 hover:bg-foreground/[0.05] hover:text-foreground'
													)}
												>
													{/* Icon container with subtle background */}
													<div
														className={cn(
															'flex-shrink-0 flex items-center justify-center',
															'w-8 h-8 rounded-lg',
															'transition-all duration-200',
															isActive(subItem.href)
																? 'bg-foreground/[0.08]'
																: 'bg-foreground/[0.03] group-hover/item:bg-foreground/[0.06]'
														)}
													>
														<subItem.icon
															className={cn(
																'h-4 w-4 transition-colors duration-200',
																isActive(subItem.href)
																	? 'text-foreground'
																	: 'text-muted-foreground group-hover/item:text-foreground'
															)}
														/>
													</div>

													{/* Text content */}
													<div className="flex flex-col gap-0.5 min-w-0 py-0.5">
														<span className="font-medium leading-tight truncate">
															{subItem.label}
														</span>
														{subItem.description && (
															<span className="text-[12px] text-muted-foreground/70 leading-snug line-clamp-2">
																{subItem.description}
															</span>
														)}
													</div>
												</Link>
											</DropdownMenuItem>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</li>
					);
				}

				// Simple navigation item without dropdown
				return (
					<li key={item.href} className="relative">
						<Link
							href={item.href}
							className={cn(
								'group relative flex items-center gap-2 px-4 py-2 rounded-full',
								'text-[14px] font-medium tracking-[-0.01em]',
								'transition-all duration-300 ease-out',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
								'touch-manipulation select-none',
								itemIsActive
									? 'text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							)}
							aria-current={itemIsActive ? 'page' : undefined}
						>
							{/* Background highlight */}
							<span
								className={cn(
									'absolute inset-0 rounded-full transition-all duration-300',
									itemIsActive
										? 'bg-foreground/[0.06]'
										: 'bg-transparent group-hover:bg-foreground/[0.04]'
								)}
							/>

							{/* Content */}
							<span className="relative flex items-center gap-2">
								<item.icon
									className={cn(
										'h-4 w-4 transition-colors duration-300',
										itemIsActive
											? 'text-foreground'
											: 'text-muted-foreground group-hover:text-foreground'
									)}
								/>
								<span className="relative">{item.label}</span>
							</span>

							{/* Active indicator dot */}
							{itemIsActive && (
								<motion.span
									layoutId="activeNavIndicator"
									className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/60"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', stiffness: 500, damping: 30 }}
								/>
							)}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
