import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
	title: 'Sign-in Error | Spicy TV',
	description: 'Signing in did not go through. Try again.',
};

// TODO: Cache Components adoption. Per-visit route (searchParams); stays dynamic.
export const instant = false;

const ERROR_COPY: Record<string, string> = {
	Configuration: 'Our sign-in service is not wired up right. Try again in a moment.',
	AccessDenied: 'That account is not allowed to sign in here.',
	Verification: 'That step is no longer valid. Sign in again to carry on.',
	Default: 'Something broke on the way in. Nothing was saved.',
};

export default async function AuthErrorPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string | string[] }>;
}) {
	const params = await searchParams;
	const raw = Array.isArray(params.error) ? params.error[0] : params.error;
	const message = (raw && ERROR_COPY[raw]) || ERROR_COPY.Default;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-gutter">
			<div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-sm bg-destructive/10">
					<AlertCircle className="h-8 w-8 text-destructive" />
				</div>

				<div className="flex flex-col gap-2">
					<h1 className="font-display text-display-2 text-balance uppercase text-foreground">
						The sign-in jammed.
					</h1>
					<p className="text-small text-muted-foreground">{message}</p>
				</div>

				<div className="flex items-center justify-center gap-3">
					<Button asChild variant="default">
						<Link href="/auth/signin" prefetch={false}>
							Try Again
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/" prefetch={false}>
							<Home className="h-4 w-4" />
							Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
