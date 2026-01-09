'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AuthButton() {
	const { data: session, status } = useSession();
	const router = useRouter();

	if (status === 'loading') {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-10 w-10 rounded-full border border-white/10 bg-white/5"
				disabled
			>
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
			</Button>
		);
	}

	if (!session) {
		return (
			<Button
				onClick={() => signIn()}
				variant="outline"
				className="hidden md:flex items-center gap-2 border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
			>
				<User className="w-4 h-4" />
				<span>Sign In</span>
			</Button>
		);
	}

	const userInitials = session.user?.name
		?.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'U';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
				>
					<Avatar className="h-10 w-10">
						<AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
						<AvatarFallback className="bg-primary/20 text-primary font-bold">
							{userInitials}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border-white/10 shadow-2xl">
				<DropdownMenuLabel className="text-white">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{session.user?.name || 'User'}</p>
						<p className="text-xs leading-none text-white/60">{session.user?.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-white/10" />
				<DropdownMenuItem
					onClick={() => router.push('/profile')}
					className="text-white/90 hover:text-white hover:bg-white/10 cursor-pointer"
				>
					<Settings className="w-4 h-4 mr-2" />
					<span>Profile Settings</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-white/10" />
				<DropdownMenuItem
					onClick={() => signOut({ callbackUrl: '/' })}
					className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
				>
					<LogOut className="w-4 h-4 mr-2" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
