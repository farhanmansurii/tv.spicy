import React from 'react';

interface MediaDetailsShellProps {
	children: React.ReactNode;
}

/**
 * Apple TV+ cinematic page shell.
 * Pure black background with zero light bleed for OLED depth.
 */
export default function MediaDetailsShell({ children }: MediaDetailsShellProps) {
	return (
		<div className="w-full min-h-screen bg-black text-white antialiased selection:bg-white/20 selection:text-white">
			{children}
		</div>
	);
}
