'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log to error tracking service in production
		if (process.env.NODE_ENV === 'production') {
			// TODO: Send to Sentry/Datadog/etc
		}
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="flex justify-center">
					<div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Something went wrong
					</h1>
					<p className="text-sm text-muted-foreground">
						We encountered an unexpected error. Try refreshing the page or go back home.
					</p>
				</div>

				{process.env.NODE_ENV === 'development' && (
					<div className="rounded-lg bg-muted/50 p-3 text-left">
						<p className="text-xs font-mono text-destructive truncate">
							{error.message}
						</p>
						{error.digest && (
							<p className="text-[10px] font-mono text-muted-foreground mt-1">
								Digest: {error.digest}
							</p>
						)}
					</div>
				)}

				<div className="flex items-center justify-center gap-3">
					<Button onClick={reset} variant="default" className="gap-2">
						<RefreshCw className="h-4 w-4" />
						Try again
					</Button>
					<Button asChild variant="outline" className="gap-2">
						<Link href="/">
							<Home className="h-4 w-4" />
							Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
