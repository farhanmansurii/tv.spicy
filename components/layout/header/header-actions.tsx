'use client';

import * as React from 'react';

import { SearchTrigger } from '@/components/features/search/search-trigger';
import { AuthButton } from '@/components/auth/auth-button';

export function HeaderActions() {
	return (
		<div className="flex items-center gap-1">
			<SearchTrigger
				variant="icon"
				className="h-10 w-10 rounded-full text-foreground/70 can-hover:bg-foreground/[0.08] can-hover:text-foreground active:scale-97 motion-reduce:active:scale-100"
			/>
			<AuthButton />
		</div>
	);
}
