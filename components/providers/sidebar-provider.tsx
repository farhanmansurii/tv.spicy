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
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 rounded-sm bg-foreground px-4 py-2.5 text-ui font-semibold text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
