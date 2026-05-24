'use client';

import React from 'react';

/**
 * Semantic layout primitives — zero styling.
 * All visual design will be applied via /frontend-design.
 */

export function DetailShell({
	children,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	return <section {...props}>{children}</section>;
}

export function DetailHeader({
	title,
	subtitle,
	action,
}: {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
}) {
	return (
		<header data-section-header>
			<div>
				<h2 data-section-title>{title}</h2>
				{subtitle && <span data-section-subtitle>{subtitle}</span>}
			</div>
			{action && <div data-section-action>{action}</div>}
		</header>
	);
}

export function DetailPill({ label }: { label: string }) {
	return <span data-pill>{label}</span>;
}
