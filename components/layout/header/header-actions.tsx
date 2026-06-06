'use client';

import * as React from 'react';

import { SearchTrigger } from '@/components/features/search/search-trigger';
import { AuthButton } from '@/components/auth/auth-button';

export function HeaderActions() {
	return (
		<div className="flex items-center gap-1.5 sm:gap-2">
			<SearchTrigger />
			<AuthButton />
		</div>
	);
}
