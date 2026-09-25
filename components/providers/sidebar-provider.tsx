'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider as UISidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import { Header } from '@/components/layout/header/header';
import { cn } from '@/lib/utils';

import Footer from '@/components/layout/footer/footer';

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isSearchPage = pathname === '/search';

	return (
		<UISidebarProvider defaultOpen={false}>
			<a
				href="#main-content"
				className="fixed left-[-9999px] top-4 z-[100] rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black focus:left-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
			>
				Skip to main content
			</a>
			<AppSidebar />
			<div className="flex flex-col min-h-screen w-full">
				<Header />
				<main
					id="main-content"
					tabIndex={-1}
					className={cn(
						'flex-1 w-full outline-none',
						isSearchPage ? 'pt-6 lg:pt-0' : 'pt-16 lg:pt-0'
					)}
				>
					{children}
				</main>
				<Footer />
			</div>
		</UISidebarProvider>
	);
}
