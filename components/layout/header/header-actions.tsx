'use client';

import * as React from 'react';

import { SearchTrigger } from '@/components/features/search/search-trigger';
import { AuthButton } from '@/components/auth/auth-button';

export function HeaderActions() {
	return (
		<div className="flex items-center gap-1">
			<SearchTrigger
				variant="icon"
				className="h-10 w-10 rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
			/>
			<AuthButton />
		</div>
	);
}
