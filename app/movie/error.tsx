'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Movie page error:', error);
	}, [error]);

	return (
		<div className="flex min-h-96 items-center px-gutter py-16">
			<div className="w-full max-w-prose">
				<p className="font-mono text-caption uppercase tracking-label text-destructive">
					Error
				</p>
				<h2 className="mt-4 text-title text-balance text-text">
					Couldn’t load movies
				</h2>
				<p className="mt-3 text-lede text-soft max-w-prose-secondary">
					We hit an issue loading this section. Try again in a moment.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Button onClick={() => reset()}>Try again</Button>
				</div>
			</div>
		</div>
	);
}
