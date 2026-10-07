'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ReelEmptyStateProps {
	icon: React.ReactNode;
	title: string;
	caption: string;
	actionLabel?: string;
	actionHref?: string;
}

/** The editorial empty state shared by every saved-list section. */
export function ReelEmptyState({
	icon,
	title,
	caption,
	actionLabel = 'Browse films',
	actionHref = '/movie',
}: ReelEmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 px-gutter py-16 text-center md:py-24">
			<span className="text-dim" aria-hidden="true">
				{icon}
			</span>
			<h2 className="text-title text-balance text-foreground">
				{title}
			</h2>
			<p className="max-w-md font-mono text-micro uppercase leading-relaxed tracking-meta text-dim">
				{caption}
			</p>
			<Button asChild className="mt-2 min-h-11">
				<Link href={actionHref} prefetch={false}>
					{actionLabel}
				</Link>
			</Button>
		</div>
	);
}
