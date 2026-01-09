'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
	const searchParams = useSearchParams();
	const error = searchParams.get('error');

	const errorMessages: Record<string, string> = {
		Configuration: 'There is a problem with the server configuration.',
		AccessDenied: 'You do not have permission to sign in.',
		Verification: 'The verification token has expired or has already been used.',
		Default: 'An error occurred during authentication.',
	};

	const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Container className="w-full max-w-md">
				<div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
					<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
					<p className="text-white/60 mb-6">{errorMessage}</p>
					<Link href="/auth/signin">
						<Button className="w-full">Try Again</Button>
					</Link>
				</div>
			</Container>
		</div>
	);
}
