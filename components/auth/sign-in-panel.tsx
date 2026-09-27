'use client';

import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoogleLogo, SpinnerGapIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';

const inputClassName =
	'h-12 w-full rounded-sm border border-border-strong bg-card px-4 text-foreground placeholder:text-dim outline-none transition-[border-color,box-shadow] duration-(--duration-ui) focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

interface SignInPanelProps {
	backdropPath: string | null;
	callbackUrl: string;
	errorParam: string | null;
}

const OAUTH_ERRORS: Record<string, string> = {
	INVALID_CREDENTIALS: 'Invalid email or password.',
	EMAIL_NOT_VERIFIED: 'Please verify your email address.',
	ACCOUNT_LOCKED: 'Account is locked. Please contact support.',
};

function oauthErrorMessage(error: string | null): string | null {
	if (!error) return null;
	return OAUTH_ERRORS[error] ?? 'The reel jammed. Try again in a moment.';
}

export default function SignInPanel({ backdropPath, callbackUrl, errorParam }: SignInPanelProps) {
	const router = useRouter();
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);

	const oauthError = oauthErrorMessage(errorParam);

	const handleGoogleSignIn = () => {
		setIsGoogleLoading(true);
		signIn.social({
			provider: 'google',
			callbackURL: callbackUrl,
		});
	};

	const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsEmailLoading(true);
		setEmailError(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const result = await signIn.email({ email, password });

			if (result.error) {
				setEmailError('That email and password do not match an account.');
			} else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setEmailError('The reel jammed. Try again in a moment.');
		} finally {
			setIsEmailLoading(false);
		}
	};

	return (
		<div className="flex min-h-dvh w-full flex-col bg-background text-foreground lg:grid lg:grid-cols-2">
			{/* The band absorbs the height the actions do not need on mobile, capped
			    so the pill stays above the fold; at lg the caps come off and it
			    fills the grid row instead. */}
			<div className="relative order-first min-h-56 max-h-96 flex-1 overflow-hidden lg:order-last lg:min-h-0 lg:max-h-none">
				<div className="absolute inset-0 bg-gradient-band" aria-hidden="true" />
				{backdropPath && <ProgressiveImage path={backdropPath} priority />}
				<div
					className="absolute inset-0 bg-linear-to-b from-background/70 to-transparent to-35%"
					aria-hidden="true"
				/>
				<div
					className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent lg:bg-linear-to-r lg:from-background lg:via-background/45 lg:to-transparent"
					aria-hidden="true"
				/>
			</div>

			<main className="order-last flex items-center px-gutter py-8 lg:order-first lg:py-0">
				<div className="flex w-full max-w-md flex-col">
					<p className="font-mono text-caption uppercase tracking-label text-dim">
						Spicy TV
					</p>
					<h1 className="mt-3 font-display text-display-2 text-balance uppercase leading-none text-foreground">
						Take your seat.
					</h1>
					<p className="mt-3 font-mono text-caption uppercase tracking-label text-dim">
						Sync your list · Resume anywhere
					</p>

					<div className="mt-8 flex flex-col">
						<Button
							type="button"
							variant="default"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}
							aria-busy={isGoogleLoading}
							className="w-full"
						>
							{isGoogleLoading ? (
								<SpinnerGapIcon size={18} className="animate-spin" aria-hidden="true" />
							) : (
								<GoogleLogo size={18} weight="bold" aria-hidden="true" />
							)}
							Continue with Google
						</Button>
						<p aria-live="polite" className="mt-2 min-h-5 text-small text-destructive">
							{oauthError}
						</p>
					</div>

					<button
						type="button"
						onClick={() => setShowEmailForm((v) => !v)}
						aria-expanded={showEmailForm}
						className="mt-2 self-start font-mono text-micro uppercase tracking-meta text-dim transition-colors duration-(--duration-ui) can-hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						Have a password? Sign in with email
					</button>

					{showEmailForm && (
						<form onSubmit={handleEmailSignIn} className="mt-5 flex flex-col gap-3">
							<input
								type="email"
								name="email"
								required
								autoComplete="email"
								aria-label="Email address"
								placeholder="Email address"
								className={inputClassName}
							/>
							<input
								type="password"
								name="password"
								required
								autoComplete="current-password"
								aria-label="Password"
								placeholder="Password"
								className={inputClassName}
							/>
							<Button
								type="submit"
								variant="outline"
								disabled={isEmailLoading}
								aria-busy={isEmailLoading}
								className="w-full"
							>
								{isEmailLoading && (
									<SpinnerGapIcon size={18} className="animate-spin" aria-hidden="true" />
								)}
								{isEmailLoading ? 'Signing in' : 'Sign in with email'}
							</Button>
							<p aria-live="polite" className="min-h-5 text-small text-destructive">
								{emailError}
							</p>
							<p className="font-mono text-micro uppercase tracking-meta text-dim">
								Existing accounts only
							</p>
						</form>
					)}
				</div>
			</main>
		</div>
	);
}
