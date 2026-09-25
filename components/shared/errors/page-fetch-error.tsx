'use client';

import { useState } from 'react';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface PageFetchErrorProps {
	title?: string;
	description?: string;
	className?: string;
}

export function PageFetchError({
	title = 'Something went wrong',
	description = 'We couldn’t load this page’s content. Try again in a moment.',
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
			className={cn('flex min-h-[60vh] items-center justify-center px-4 py-16', className)}
		>
			<div className="w-full max-w-md rounded-3xl bg-white/[0.025] px-6 py-10 text-center ring-1 ring-inset ring-white/[0.06]">
				<WarningCircleIcon
					size={36}
					weight="fill"
					aria-hidden="true"
					className="mx-auto text-[#FF453A]"
				/>
				<h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-white">{title}</h1>
				<p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
				<button
					type="button"
					onClick={handleRetry}
					disabled={isRetrying}
					aria-busy={isRetrying}
					className={cn(
						'mt-6 min-h-11 rounded-full bg-white px-6 text-sm font-semibold text-black',
						'disabled:opacity-60',
						'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
					)}
				>
					{isRetrying ? 'Trying…' : 'Try again'}
				</button>
			</div>
		</div>
	);
}
