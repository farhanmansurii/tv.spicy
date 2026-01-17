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
		<html>
			<body>
				<div className="min-h-screen flex items-center justify-center p-6">
					<div className="w-full max-w-md text-center space-y-4">
						<h2 className="text-2xl font-bold">Unexpected error</h2>
						<p className="text-muted-foreground">
							We hit an unexpected issue. Please try again.
						</p>
						<div className="flex items-center justify-center gap-3">
							<Button onClick={() => reset()}>Try again</Button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
