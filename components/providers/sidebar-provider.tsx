import { SidebarProvider as UISidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
	return (
		<UISidebarProvider defaultOpen={false}>
			<AppSidebar />
			<main className="w-full">{children}</main>
		</UISidebarProvider>
	);
}
