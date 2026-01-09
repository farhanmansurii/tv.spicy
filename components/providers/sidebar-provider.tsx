import { SidebarProvider as UISidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import { Header } from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
	return (
		<UISidebarProvider defaultOpen={false}>
			<AppSidebar />
			<div className="flex flex-col min-h-screen w-full">
				<Header />
				<main className="flex-1 w-full">{children}</main>
				<Footer />
			</div>
		</UISidebarProvider>
	);
}
