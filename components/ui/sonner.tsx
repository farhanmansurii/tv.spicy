'use client';

import * as React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ className, toastOptions, style, ...props }: ToasterProps) {
	return (
		<Sonner
			theme="dark"
			position="bottom-center"
			offset={64}
			toastOptions={{
				...toastOptions,
				classNames: {
					toast: '!rounded-full !bg-foreground !text-background !font-sans !text-ui !font-medium !tracking-normal !px-5 !py-3 !shadow-lg border-0',
					error: '!bg-destructive !text-destructive-foreground',
					...toastOptions?.classNames,
				},
			}}
			className={className ?? 'group'}
			style={
				{
					'--normal-bg': 'var(--foreground)',
					'--normal-text': 'var(--background)',
					'--normal-border': 'transparent',
					'--error-bg': 'var(--destructive)',
					'--error-text': 'var(--destructive-foreground)',
					'--error-border': 'transparent',
					'--border-radius': '9999px',
					...style,
				} as React.CSSProperties
			}
			{...props}
		/>
	);
}

export { Toaster };
