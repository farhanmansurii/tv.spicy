'use client';

import React, { useEffect } from 'react';
import { setupSectionReveals } from '@/lib/motion';

interface MediaDetailsShellProps {
	children: React.ReactNode;
}

export default function MediaDetailsShell({ children }: MediaDetailsShellProps) {
	useEffect(() => {
		const cleanup = setupSectionReveals('.dv-section');
		return () => {
			cleanup?.();
		};
	}, []);

	return (
		<div className="w-full min-h-screen bg-background text-text antialiased">
			{children}
		</div>
	);
}
