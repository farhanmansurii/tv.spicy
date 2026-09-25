'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, Copy, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

function buildErrorReport(error: Error & { digest?: string }): string {
	return [
		'Spicy TV error report',
		`Time: ${new Date().toISOString()}`,
		`Route: ${window.location.href}`,
		`Digest: ${error.digest ?? 'none'}`,
		`Message: ${error.message}`,
		`Stack: ${error.stack ?? 'none'}`,
	].join('\n');
}

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

	useEffect(() => {
		console.error('[app/error] unhandled error', {
			digest: error.digest,
			message: error.message,
			stack: error.stack,
			route: window.location.href,
		});
	}, [error]);

	const copyReport = async () => {
		try {
			await navigator.clipboard.writeText(buildErrorReport(error));
			setCopyState('copied');
		} catch {
			setCopyState('failed');
		}
	};

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
						We encountered an unexpected error. Try again, or copy the error report and
						send it to us so we can fix it.
					</p>
					{error.digest && (
						<p className="text-xs font-mono text-muted-foreground">
							Reference: {error.digest}
						</p>
					)}
				</div>

				{process.env.NODE_ENV === 'development' && (
					<div className="rounded-lg bg-muted/50 p-3 text-left">
						<p className="text-xs font-mono text-destructive truncate">
							{error.message}
						</p>
					</div>
				)}

				{copyState === 'failed' && (
					<pre className="rounded-lg bg-muted/50 p-3 text-left text-[10px] font-mono text-muted-foreground overflow-auto max-h-40">
						{buildErrorReport(error)}
					</pre>
				)}

				<div className="flex flex-col items-center gap-3">
					<Button onClick={reset} variant="default" className="gap-2 w-full">
						<RefreshCw className="h-4 w-4" />
						Try again
					</Button>
					<div className="flex items-center justify-center gap-3">
						<Button onClick={copyReport} variant="outline" className="gap-2">
							{copyState === 'copied' ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							{copyState === 'copied' ? 'Copied' : 'Copy error report'}
						</Button>
						<Button asChild variant="outline" className="gap-2">
							<Link href="/" prefetch={false}>
								<Home className="h-4 w-4" />
								Home
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
