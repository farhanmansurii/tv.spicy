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

export function AuthButton() {
	const { data: session, status } = useSession();
	const router = useRouter();

	if (status === 'loading') {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 touch-manipulation"
				disabled
				aria-label="Loading authentication"
			>
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400" />
			</Button>
		);
	}

	if (!session) {
		return (
			<Button
				onClick={() => signIn()}
				variant="outline"
				size="icon"
				className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-200 touch-manipulation"
				aria-label="Sign in to your account"
			>
				<User className="w-5 h-5" strokeWidth={2} />
			</Button>
		);
	}

	const userInitials = session.user?.name
		?.split(' ')
		.map((name) => name[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'U';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-manipulation p-0"
					aria-label="Account menu"
					aria-haspopup="true"
				>
					<Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
						<AvatarImage
							src={session.user?.image || ''}
							alt={session.user?.name || 'User account'}
						/>
						<AvatarFallback className="bg-blue-500 text-white text-[13px] sm:text-[15px] font-semibold">
							{userInitials}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg rounded-2xl p-2 mt-2"
			>
				<DropdownMenuLabel className="px-3 py-2.5">
					<div className="flex flex-col gap-0.5">
						<p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
							{session.user?.name || 'User'}
						</p>
						<p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight">
							{session.user?.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
				<DropdownMenuItem
					onClick={() => router.push('/profile')}
					className="px-3 py-2.5 text-[15px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl cursor-pointer transition-colors duration-150 touch-manipulation"
				>
					<Settings className="w-4 h-4 mr-3" strokeWidth={2} />
					<span>Profile Settings</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
				<DropdownMenuItem
					onClick={() => signOut({ callbackUrl: '/' })}
					className="px-3 py-2.5 text-[15px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer transition-colors duration-150 touch-manipulation"
				>
					<LogOut className="w-4 h-4 mr-3" strokeWidth={2} />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
