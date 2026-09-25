'use client';

import { signIn } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignInPage } from '@/components/ui/sign-in';
import { toast } from 'sonner';

/**
 * Only same-origin relative paths may be used as a post-sign-in redirect.
 * Protocol-relative URLs (`//evil.com`), backslash tricks (`/\evil.com`) and
 * control characters (browsers strip tabs/newlines before URL parsing, turning
 * `/\t/evil.com` into `//evil.com`) are rejected — fall back to the home page
 * so `callbackUrl` can never become an open redirect.
 */
const UNSAFE_CALLBACK = /[\u0000-\u001F\u007F\\]/;

function safeCallbackUrl(value: string | null): string {
	if (
		!value ||
		!value.startsWith('/') ||
		value.startsWith('//') ||
		UNSAFE_CALLBACK.test(value)
	) {
		return '/';
	}
	return value;
}

export default function SignInPageWrapper() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
	const errorParam = searchParams.get('error');
	const [isLoading, setIsLoading] = useState(false);

	const getErrorMessage = (error: string | null): string | null => {
		if (!error) return null;
		const errorMessages: Record<string, string> = {
			INVALID_CREDENTIALS: 'Invalid email or password.',
			EMAIL_NOT_VERIFIED: 'Please verify your email address.',
			ACCOUNT_LOCKED: 'Account is locked. Please contact support.',
		};
		return errorMessages[error] || 'An error occurred. Please try again.';
	};

	const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);

		const formData = new FormData(event.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const result = await signIn.email({
				email,
				password,
			});

			if (result.error) {
				toast.error(result.error.message || 'Invalid email or password');
			} else {
				toast.success('Signed in successfully');
				router.push(callbackUrl);
				router.refresh();
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = () => {
		signIn.social({
			provider: 'google',
			callbackURL: callbackUrl,
		});
	};

	return (
		<SignInPage
			title={
				<span className="font-light text-foreground tracking-tighter">
					Welcome to <span className="font-semibold">SpicyTV</span>
				</span>
			}
			description="Sign in to sync your watchlist and continue watching your favorite shows and movies"
			onSignIn={handleEmailSignIn}
			onGoogleSignIn={handleGoogleSignIn}
			isLoading={isLoading}
			error={getErrorMessage(errorParam)}
		/>
	);
}
