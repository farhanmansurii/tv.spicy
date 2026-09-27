'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Global error:', error);
	}, [error]);

	return (
		<html lang="en">
			<body className="bg-background text-foreground antialiased">
				<main className="flex min-h-svh flex-col justify-center px-gutter py-16">
					<div className="max-w-prose">
						<p className="font-mono text-caption uppercase tracking-label text-destructive">
							Error
						</p>

						<h1 className="mt-4 font-display text-display-2 uppercase text-text text-balance">
							The projector jammed.
						</h1>

						<p className="mt-4 text-lede text-soft max-w-prose">
							The reel stopped mid-frame and we could not find your place in it. Try
							again, and if it keeps jamming the shelf is worth a look.
						</p>

						<div className="mt-8">
							<Button onClick={() => reset()}>Try again</Button>
						</div>
					</div>
				</main>
			</body>
		</html>
	);
}
