'use client';

import { useState } from 'react';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageFetchErrorProps {
	title?: string;
	description?: string;
	className?: string;
}

export function PageFetchError({
	title = 'The projector jammed.',
	description = 'We couldn’t load this page from the shelf. Try again in a moment.',
	className,
}: PageFetchErrorProps) {
	const [isRetrying, setIsRetrying] = useState(false);

	// A reload re-runs the server render; router.refresh() could serve the same
	// cached payload, and this state resets with the document.
	const handleRetry = () => {
		setIsRetrying(true);
		window.location.reload();
	};

	return (
		<div
			role="alert"
			aria-live="assertive"
			className={cn(
				'flex min-h-error items-center justify-center px-gutter py-16',
				className
			)}
		>
			<div className="w-full max-w-prose">
				<p className="flex items-center gap-2 font-mono text-caption uppercase tracking-label text-destructive">
					<WarningCircleIcon size={16} weight="fill" aria-hidden="true" />
					Error
				</p>

				<h1 className="mt-4 text-title text-balance text-text">
					{title}
				</h1>

				<p className="mt-3 text-lede text-soft max-w-prose-secondary">{description}</p>

				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Button onClick={handleRetry} disabled={isRetrying} aria-busy={isRetrying}>
						{isRetrying ? 'Trying…' : 'Try again'}
					</Button>
				</div>
			</div>
		</div>
	);
}
