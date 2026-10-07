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
		<main className="flex min-h-error flex-col justify-center px-gutter pt-safe-header pb-16">
			<div className="max-w-prose">
				<p className="flex items-center gap-2 font-mono text-caption uppercase tracking-label text-destructive">
					<AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
					Error
				</p>

				<h1 className="mt-4 text-title text-balance text-text">
					The projector jammed.
				</h1>

				<p className="mt-4 text-lede text-soft max-w-prose">
					The reel stopped mid-frame. Try again, and if it keeps jamming send us the
					report below.
				</p>

				{error.digest ? (
					<p className="mt-3 font-mono text-micro uppercase tracking-label text-dim">
						Reference: {error.digest}
					</p>
				) : null}

				{process.env.NODE_ENV === 'development' ? (
					<p className="mt-3 truncate font-mono text-micro text-destructive">
						{error.message}
					</p>
				) : null}

				{copyState === 'failed' ? (
					<pre className="mt-3 max-h-40 overflow-auto rounded-sm border border-line bg-surface p-3 text-left font-mono text-micro leading-relaxed text-dim">
						{buildErrorReport(error)}
					</pre>
				) : null}

				{copyState === 'failed' ? (
					<p role="status" className="mt-3 font-mono text-micro uppercase tracking-label text-destructive">
						Copy failed. Select the report and copy it by hand.
					</p>
				) : null}

				<div className="mt-8 flex flex-wrap items-center gap-3">
					<Button onClick={reset} variant="default">
						<RefreshCw aria-hidden="true" />
						Try again
					</Button>
					<Button onClick={copyReport} variant="outline">
						{copyState === 'copied' ? (
							<Check aria-hidden="true" />
						) : (
							<Copy aria-hidden="true" />
						)}
						{copyState === 'copied' ? 'Copied' : 'Copy error report'}
					</Button>
					<Button asChild variant="outline">
						<Link href="/" prefetch={false}>
							<Home aria-hidden="true" />
							Home
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
