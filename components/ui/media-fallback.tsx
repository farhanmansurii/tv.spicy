import React from 'react';
import { cn } from '@/lib/utils';

export interface MediaFallbackProps {
	label?: string;
	initials?: string;
	episodeNumber?: number | string;
	variant?: 'poster' | 'still' | 'backdrop' | 'portrait';
	className?: string;
}

export function MediaFallback({
	label,
	initials,
	episodeNumber,
	variant = 'poster',
	className,
}: MediaFallbackProps) {
	if (variant === 'portrait') {
		const text = initials || label?.slice(0, 2) || '';
		return (
			<div
				aria-hidden="true"
				className={cn(
					'relative flex h-full w-full items-center justify-center rounded-sm bg-gradient-card-placeholder shadow-inset-line',
					className
				)}
			>
				<span className="font-display uppercase text-ui text-dim tracking-label">
					{text}
				</span>
			</div>
		);
	}

	if (variant === 'backdrop') {
		return (
			<div
				aria-hidden="true"
				className={cn(
					'relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-band shadow-inset-line',
					className
				)}
			>
				{label ? (
					<span className="absolute inset-x-gutter bottom-1/4 font-display uppercase text-display-1 text-dim/20 break-anywhere">
						{label}
					</span>
				) : null}
			</div>
		);
	}

	if (variant === 'still') {
		const displayText =
			episodeNumber !== undefined
				? String(episodeNumber).padStart(2, '0')
				: label;

		return (
			<div
				aria-hidden="true"
				className={cn(
					'relative flex h-full w-full items-end p-3 rounded-sm bg-surface shadow-inset-line',
					className
				)}
			>
				{displayText ? (
					<span className="font-display uppercase text-display-4 text-text break-anywhere">
						{displayText}
					</span>
				) : null}
			</div>
		);
	}

	return (
		<div
			aria-hidden="true"
			className={cn(
				'relative flex h-full w-full items-end p-3 rounded-sm bg-gradient-card-placeholder shadow-inset-line',
				className
			)}
		>
			{label ? (
				<span className="font-display uppercase text-display-4 text-dim break-anywhere">
					{label}
				</span>
			) : null}
		</div>
	);
}
