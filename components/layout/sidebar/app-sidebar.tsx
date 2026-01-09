'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
	Home,
	Clapperboard,
	Tv,
	List,
	Sparkles,
	Play,
	Heart,
	Star,
	Calendar,
} from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from '@/components/ui/sidebar';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchCommandBox } from '@/components/features/search/search-command-box';
import { navigationItems } from '../header/navigation-data';

export function AppSidebar() {
	const { setOpen } = useSidebar();
	const [openSections, setOpenSections] = React.useState<Set<string>>(new Set());
	const pathname = usePathname();

	React.useEffect(() => {
		// Auto-expand sections if current path matches
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
		setOpen(false);
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
				'--sidebar-width': '80vw',
			} as React.CSSProperties}
		>
			<SidebarHeader className="border-b border-sidebar-border pb-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg" className="data-[active=true]:bg-sidebar-accent h-auto py-3">
							<Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 w-full">
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
								<div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
									<span className="text-[17px] font-semibold tracking-[-0.41px] leading-none text-sidebar-foreground truncate w-full">
										Watvh TV
									</span>
									<span className="text-[13px] text-muted-foreground leading-none">
										Streaming
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="custom-scrollbar w-full">
				{/* Mobile Search */}
				<div className="px-3 pb-3 border-b border-sidebar-border mb-2">
					<SearchCommandBox />
				</div>

				<SidebarGroup className="px-1">
					<SidebarMenu>
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
										<SidebarMenuItem>
											<CollapsibleTrigger asChild>
												<SidebarMenuButton
													isActive={itemIsActive}
													className="w-full h-12 text-[15px] font-medium"
												>
													<item.icon className="h-5 w-5" />
													<span>{item.label}</span>
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub className="ml-2">
													{item.items?.map((subItem) => (
														<SidebarMenuSubItem key={subItem.href}>
															<SidebarMenuSubButton
																asChild
																isActive={isActive(subItem.href)}
																size="md"
																className="h-auto py-2.5"
															>
																<Link href={subItem.href} onClick={handleLinkClick} className="w-full">
																	<subItem.icon className="h-4 w-4 flex-shrink-0" />
																	<div className="flex flex-col gap-0.5 flex-1 min-w-0">
																		<span className="text-[15px] font-medium">{subItem.label}</span>
																		{subItem.description && (
																			<span className="text-[13px] text-muted-foreground leading-tight line-clamp-1">
																				{subItem.description}
																			</span>
																		)}
																	</div>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													))}
												</SidebarMenuSub>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								);
							}

							return (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={itemIsActive} className="h-12 text-[15px] font-medium">
										<Link href={item.href} onClick={handleLinkClick} className="w-full">
											<item.icon className="h-5 w-5" />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
