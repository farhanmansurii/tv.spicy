'use client';

import { signIn } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignInPage } from '@/components/ui/sign-in';
import { toast } from 'sonner';

export default function SignInPageWrapper() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const callbackUrl = searchParams.get('callbackUrl') || '/';
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
