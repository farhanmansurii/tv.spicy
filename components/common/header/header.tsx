import Link from 'next/link';
import CommonContainer from '@/components/container/CommonContainer';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export const Header = () => {
	return (
		<CommonContainer>
			<nav
				className="flex items-center justify-between py-4"
				role="navigation"
				aria-label="Main navigation"
			>
				<div className="flex items-center gap-4">
					<Link href="/" className="flex items-center h-10">
						<img
							src="/logo.webp"
							alt="App logo"
							className="w-10 h-10"
							width={40}
							height={40}
						/>
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<SidebarTrigger>
						<Menu className="w-5 h-5" />
					</SidebarTrigger>
				</div>
			</nav>
		</CommonContainer>
	);
};
