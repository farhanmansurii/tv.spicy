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
		console.error('TV page error:', error);
	}, [error]);

	return (
		<div className="min-h-[60vh] flex items-center justify-center p-6">
			<div className="w-full max-w-md text-center space-y-4">
				<h2 className="text-2xl font-bold">Couldn’t load TV content</h2>
				<p className="text-muted-foreground">
					We hit an issue loading this section. Please try again.
				</p>
				<div className="flex items-center justify-center gap-3">
					<Button onClick={() => reset()}>Try again</Button>
				</div>
			</div>
		</div>
	);
}
