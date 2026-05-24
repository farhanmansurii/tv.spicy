import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Film, Home, Search } from 'lucide-react';

export const metadata = {
	title: 'Not Found | Spicy TV',
	description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="flex justify-center">
					<div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
						<Film className="h-8 w-8 text-primary" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Page not found
					</h1>
					<p className="text-sm text-muted-foreground">
						We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
					</p>
				</div>

				<div className="flex items-center justify-center gap-3">
					<Button asChild variant="default" className="gap-2">
						<Link href="/">
							<Home className="h-4 w-4" />
							Home
						</Link>
					</Button>
					<Button asChild variant="outline" className="gap-2">
						<Link href="/search">
							<Search className="h-4 w-4" />
							Search
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
