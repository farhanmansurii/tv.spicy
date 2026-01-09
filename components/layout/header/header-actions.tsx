'use client';

import * as React from 'react';

import { SearchCommandBox } from '@/components/features/search/search-command-box';
import { AuthButton } from '@/components/auth/auth-button';


export function HeaderActions() {
	return (
		<div className="flex items-center gap-1.5 sm:gap-2">
			<SearchCommandBox />
			<AuthButton />
		</div>
	);
}
