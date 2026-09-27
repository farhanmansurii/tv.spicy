'use client';

import { signOut } from '@/lib/auth-client';
import { useAuthStore } from '@/store/authStore';
import { adoptAuthScope } from '@/lib/sync/auth-scope';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, UserCircle, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function initialsOf(name: string | null | undefined): string {
	return (
		name
			?.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'U'
	);
}

export function AuthButton() {
	const session = useAuthStore((state) => state.session);
	const isPending = useAuthStore((state) => state.isLoading);
	const clearSession = useAuthStore((state) => state.clearSession);
	const router = useRouter();

	if (isPending) {
		return (
			<Button
				type="button"
				variant="ghost"
				size="icon"
				disabled
				aria-label="Loading account"
			>
				<Loader2 className="animate-spin" aria-hidden="true" />
			</Button>
		);
	}

	if (!session) {
		return (
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => router.push('/auth/signin')}
				aria-label="Sign in"
			>
				<User strokeWidth={1.75} aria-hidden="true" />
			</Button>
		);
	}

	const userInitials = initialsOf(session.user?.name);
	const userName = session.user?.name || 'Your account';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" size="icon" aria-label="Account menu">
					<Avatar>
						<AvatarImage src={session.user?.image || ''} alt={userName} />
						<AvatarFallback tone="raised">{userInitials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" sideOffset={8} surface="glass" className="w-72">
				<DropdownMenuLabel>
					<div className="flex items-center gap-3 px-1.5 py-1">
						<Avatar className="size-9">
							<AvatarImage src={session.user?.image || ''} alt={userName} />
							<AvatarFallback tone="raised">{userInitials}</AvatarFallback>
						</Avatar>
						<div className="flex min-w-0 flex-col gap-0.5">
							<p className="truncate text-base leading-tight font-semibold text-foreground">
								{userName}
							</p>
							<p className="truncate text-sm leading-tight text-dim">{session.user?.email}</p>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator className="my-1.5" />

				<DropdownMenuItem
					surface="glass"
					onClick={() => router.push('/profile')}
					className="cursor-pointer"
				>
					<UserCircle className="size-4 shrink-0 text-dim" aria-hidden="true" />
					<span className="flex-1">Profile</span>
					<ChevronRight className="size-4 text-faint" aria-hidden="true" />
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1.5" />

				<DropdownMenuItem
					surface="glass"
					onClick={async () => {
						await signOut();
						clearSession();
						// Move every persisted store back to the anonymous scope so the
						// signed-out view never shows the account's private lists.
						await adoptAuthScope(null);
						router.push('/');
					}}
					className="cursor-pointer"
				>
					<LogOut className="size-4 shrink-0 text-destructive" aria-hidden="true" />
					<span className="flex-1 text-destructive">Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
