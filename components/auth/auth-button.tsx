'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * AuthButton - Apple-inspired authentication button
 *
 * Features:
 * - Refined loading spinner
 * - Elegant avatar with ring effect
 * - Frosted glass dropdown menu
 * - Smooth micro-interactions
 * - Touch-friendly sizing (44px minimum)
 */
export function AuthButton() {
	const { data: session, status } = useSession();
	const router = useRouter();

	// Loading state with refined spinner
	if (status === 'loading') {
		return (
			<div
				className={cn(
					'flex items-center justify-center',
					'h-10 w-10 sm:h-11 sm:w-11 rounded-full',
					'bg-foreground/[0.03] border border-border/40'
				)}
				aria-label="Loading authentication"
			>
				<div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/60 animate-spin" />
			</div>
		);
	}

	// Signed out state
	if (!session) {
		return (
			<button
				onClick={() => signIn()}
				className={cn(
					'relative flex items-center justify-center',
					'h-10 w-10 sm:h-11 sm:w-11 rounded-full',
					'bg-foreground/[0.03] hover:bg-foreground/[0.06] active:bg-foreground/[0.08]',
					'border border-border/40 hover:border-border/60',
					'transition-all duration-300 ease-out',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
					'touch-manipulation',
					'group'
				)}
				aria-label="Sign in to your account"
			>
				<User
					className={cn(
						'h-[18px] w-[18px] sm:h-5 sm:w-5',
						'text-foreground/70 group-hover:text-foreground',
						'transition-colors duration-300'
					)}
					strokeWidth={1.75}
				/>
			</button>
		);
	}

	// Get user initials for avatar fallback
	const userInitials =
		session.user?.name
			?.split(' ')
			.map((name) => name[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'U';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'relative flex items-center justify-center',
						'h-10 w-10 sm:h-11 sm:w-11 rounded-full',
						'bg-foreground/[0.03] hover:bg-foreground/[0.06] active:bg-foreground/[0.08]',
						'border border-border/40 hover:border-border/60',
						'transition-all duration-300 ease-out',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
						'touch-manipulation',
						'group',
						'p-0.5'
					)}
					aria-label="Account menu"
					aria-haspopup="true"
				>
					<Avatar className="h-full w-full">
						<AvatarImage
							src={session.user?.image || ''}
							alt={session.user?.name || 'User account'}
							className="rounded-full"
						/>
						<AvatarFallback
							className={cn(
								'bg-gradient-to-br from-blue-500 to-blue-600',
								'text-white text-[11px] sm:text-[13px] font-semibold',
								'rounded-full'
							)}
						>
							{userInitials}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className={cn(
					'w-72 p-2',
					'bg-popover/80 backdrop-blur-2xl backdrop-saturate-[1.8]',
					'border border-border/50',
					'shadow-[0_8px_30px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]',
					'rounded-2xl',
					'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
					'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
					'duration-200'
				)}
			>
				{/* User info header */}
				<DropdownMenuLabel className="px-3 py-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage
								src={session.user?.image || ''}
								alt={session.user?.name || 'User'}
							/>
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[13px] font-semibold">
								{userInitials}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-0.5 min-w-0">
							<p className="text-[14px] font-semibold text-foreground leading-tight truncate">
								{session.user?.name || 'User'}
							</p>
							<p className="text-[12px] text-muted-foreground/70 leading-tight truncate">
								{session.user?.email}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator className="my-1.5 bg-border/50" />

				{/* Profile Settings */}
				<DropdownMenuItem
					onClick={() => router.push('/profile')}
					className={cn(
						'group/item flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer',
						'text-[14px] text-foreground/80',
						'hover:bg-foreground/[0.05] hover:text-foreground',
						'transition-all duration-200 ease-out',
						'focus:outline-none'
					)}
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								'flex items-center justify-center',
								'w-8 h-8 rounded-lg',
								'bg-foreground/[0.03] group-hover/item:bg-foreground/[0.06]',
								'transition-all duration-200'
							)}
						>
							<Settings
								className="w-4 h-4 text-muted-foreground group-hover/item:text-foreground transition-colors"
								strokeWidth={1.75}
							/>
						</div>
						<span className="font-medium">Profile Settings</span>
					</div>
					<ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover/item:text-muted-foreground transition-colors" />
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1.5 bg-border/50" />

				{/* Sign Out */}
				<DropdownMenuItem
					onClick={() => signOut({ callbackUrl: '/' })}
					className={cn(
						'group/item flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer',
						'text-[14px] text-red-500/80 dark:text-red-400/80',
						'hover:bg-red-500/[0.08] hover:text-red-500 dark:hover:text-red-400',
						'transition-all duration-200 ease-out',
						'focus:outline-none'
					)}
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								'flex items-center justify-center',
								'w-8 h-8 rounded-lg',
								'bg-red-500/[0.06] group-hover/item:bg-red-500/[0.1]',
								'transition-all duration-200'
							)}
						>
							<LogOut
								className="w-4 h-4 text-red-500/70 group-hover/item:text-red-500 dark:text-red-400/70 dark:group-hover/item:text-red-400 transition-colors"
								strokeWidth={1.75}
							/>
						</div>
						<span className="font-medium">Sign Out</span>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
