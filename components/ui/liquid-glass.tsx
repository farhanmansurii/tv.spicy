'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
	className?: string;
	children?: React.ReactNode;
	tone?: 'dark' | 'light';
	strength?: 'regular' | 'protective';
}

/**
 * Neutral, geometry-led navigation glass.
 *
 * The center stays clean while the rim, incident-light highlight, localized
 * dimming, and touch illumination define the material. There is deliberately
 * no procedural noise, authored color wash, or full-surface displacement.
 */
export function LiquidGlass({
	className,
	children,
	tone = 'dark',
	strength = 'regular',
}: LiquidGlassProps) {
	const surfaceRef = React.useRef<HTMLDivElement>(null);

	const updateTouchOrigin = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const bounds = event.currentTarget.getBoundingClientRect();
			event.currentTarget.style.setProperty(
				'--glass-touch-x',
				`${event.clientX - bounds.left}px`
			);
			event.currentTarget.style.setProperty(
				'--glass-touch-y',
				`${event.clientY - bounds.top}px`
			);
		},
		[]
	);

	return (
		<div
			ref={surfaceRef}
			className={cn('liquid-glass-surface relative isolate overflow-hidden', className)}
			data-tone={tone}
			data-strength={strength}
			onPointerMove={updateTouchOrigin}
			onPointerDown={(event) => {
				updateTouchOrigin(event);
				event.currentTarget.dataset.pressed = 'true';
			}}
			onPointerUp={(event) => {
				delete event.currentTarget.dataset.pressed;
			}}
			onPointerCancel={(event) => {
				delete event.currentTarget.dataset.pressed;
			}}
			onPointerLeave={(event) => {
				delete event.currentTarget.dataset.pressed;
			}}
		>
			<div className="liquid-glass-dimmer" aria-hidden="true" />
			<div className="liquid-glass-optics" aria-hidden="true" />
			<div className="liquid-glass-rim" aria-hidden="true" />
			<div className="liquid-glass-touch" aria-hidden="true" />
			<div className="relative z-10 h-full">{children}</div>
		</div>
	);
}
