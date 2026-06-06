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
			<AppSidebar />
			<div className="flex flex-col min-h-screen w-full">
				<Header />
				<main
					className={cn('flex-1 w-full', isSearchPage ? 'pt-6 lg:pt-0' : 'pt-16 lg:pt-0')}
				>
					{children}
				</main>
				<Footer />
			</div>
		</UISidebarProvider>
	);
}
