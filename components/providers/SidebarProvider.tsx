import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export default function NavigationProvider({
	children,
	genres,
}: {
	children: React.ReactNode;
	genres: any;
}) {
	return (
		<SidebarProvider defaultOpen={false}>
			<AppSidebar genres={genres} />
			<main className="w-full">{children}</main>
		</SidebarProvider>
	);
}
