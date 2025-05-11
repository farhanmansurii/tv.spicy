import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider defaultOpen={false}>
			<AppSidebar />
			<main className="w-full">{children}</main>
		</SidebarProvider>
	);
}
