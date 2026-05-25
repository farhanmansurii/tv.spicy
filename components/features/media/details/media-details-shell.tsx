import React from 'react';

interface MediaDetailsShellProps {
	children: React.ReactNode;
}

export default function MediaDetailsShell({ children }: MediaDetailsShellProps) {
	return (
		<div className="w-full min-h-screen bg-background text-foreground antialiased selection:bg-white/20 selection:text-white">
			{children}
		</div>
	);
}
