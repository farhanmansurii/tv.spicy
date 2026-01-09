'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';

import { SearchCommandBox } from '@/components/features/search/search-command-box';
import { AuthButton } from '@/components/auth/auth-button';
import { Button } from '@/components/ui/button';

export function HeaderActions() {
	return (
		<div className="flex items-center gap-2 sm:gap-3">
			{/* Search - Desktop: Full search box, Mobile: Icon button (handled by SearchCommandBox internally) */}
			<SearchCommandBox />

			{/* Notifications - Responsive sizing */}
			<Button
				variant="ghost"
				size="icon"
				className="h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-accent active:bg-accent/80 transition-colors duration-200 touch-manipulation relative"
				aria-label="Notifications"
				aria-describedby="notifications-description"
			>
				<Bell className="h-5 w-5 text-foreground" strokeWidth={2} />
				<span id="notifications-description" className="sr-only">
					View your notifications
				</span>
			</Button>

			{/* Auth Button - Responsive sizing */}
			<AuthButton />
		</div>
	);
}
