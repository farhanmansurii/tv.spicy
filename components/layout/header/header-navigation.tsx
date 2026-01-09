'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NavigationItem } from './navigation-data';

interface HeaderNavigationProps {
	items: NavigationItem[];
	isActive: (href: string) => boolean;
}


export function HeaderNavigation({ items, isActive }: HeaderNavigationProps) {
	const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

	return (
		<ul className="flex items-center gap-1">
			{items.map((item) => {
				const hasSubItems = item.items && item.items.length > 0;
				const itemIsActive = isActive(item.href);
				const isOpen = openDropdown === item.href;

				if (hasSubItems) {
					return (
						<li key={item.href}>
							<DropdownMenu
								open={isOpen}
								onOpenChange={(open) => setOpenDropdown(open ? item.href : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 touch-manipulation ${
											itemIsActive
												? 'text-foreground bg-accent'
												: 'text-muted-foreground hover:text-foreground hover:bg-accent'
										}`}
										aria-label={`${item.label} menu`}
										aria-expanded={isOpen}
									>
										<item.icon className="h-4 w-4" />
										<span>{item.label}</span>
										<ChevronDown
											className={`h-3.5 w-3.5 transition-transform duration-200 ${
												isOpen ? 'rotate-180' : ''
											}`}
											strokeWidth={2.5}
										/>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-64 bg-popover/95 backdrop-blur-xl border border-border shadow-lg rounded-2xl p-2 mt-2"
								>
									<DropdownMenuLabel className="px-3 py-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
										{item.label}
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="my-2 bg-border" />
									{item.items?.map((subItem) => (
										<DropdownMenuItem key={subItem.href} asChild>
											<Link
												href={subItem.href}
												className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors duration-150 touch-manipulation ${
													isActive(subItem.href)
														? 'bg-accent text-accent-foreground'
														: 'text-foreground hover:bg-accent hover:text-accent-foreground'
												}`}
											>
												<subItem.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
												<div className="flex flex-col gap-0.5">
													<span className="font-medium">{subItem.label}</span>
													{subItem.description && (
														<span className="text-[13px] text-muted-foreground leading-tight">
															{subItem.description}
														</span>
													)}
												</div>
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</li>
					);
				}

				return (
					<li key={item.href}>
						<Link
							href={item.href}
							className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 touch-manipulation ${
								itemIsActive
									? 'text-foreground bg-accent'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent'
							}`}
							aria-current={itemIsActive ? 'page' : undefined}
						>
							<item.icon className="h-4 w-4" />
							<span>{item.label}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
