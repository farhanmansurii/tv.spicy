import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export const metadata = {
	title: 'End of Reel | Spicy TV',
	description: 'Nothing is threaded at this address.',
};

export default function NotFound() {
	return (
		<main className="flex min-h-error flex-col justify-center px-gutter pt-safe-header pb-16">
			<div className="max-w-prose">
				<p className="font-mono text-caption uppercase tracking-label text-dim">
					<span className="text-brand">404</span>
					<span aria-hidden="true"> / </span>End of reel
				</p>

				<h1 className="mt-4 text-title text-balance text-text">
					Nothing here but dust.
				</h1>

				<p className="mt-4 text-lede text-soft max-w-prose">
					There is no title at this address. It may have left the schedule, or the link
					came apart somewhere in the edit.
				</p>

				<div className="mt-8 flex flex-wrap items-center gap-3">
					<Button asChild variant="default">
						<Link href="/" prefetch={false}>
							<Home className="h-4 w-4" />
							Back to browse
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/search" prefetch={false}>
							<Search className="h-4 w-4" />
							Search the archive
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
