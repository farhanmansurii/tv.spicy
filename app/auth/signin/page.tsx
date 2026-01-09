'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import { Github, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SignInPage() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/';
	const error = searchParams.get('error');

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Container className="w-full max-w-md">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
				>
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-white mb-2">Welcome to SpicyTV</h1>
						<p className="text-white/60 text-sm">Sign in to sync your watchlist and continue watching</p>
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
							<p className="text-red-400 text-sm text-center">
								{error === 'OAuthSignin' && 'Error signing in. Please try again.'}
								{error === 'OAuthCallback' && 'Error processing authentication.'}
								{error === 'OAuthCreateAccount' && 'Could not create account.'}
								{error === 'EmailCreateAccount' && 'Could not create account.'}
								{error === 'Callback' && 'Error in callback.'}
								{error === 'OAuthAccountNotLinked' && 'Account already exists with different provider.'}
								{error === 'EmailSignin' && 'Check your email for sign in link.'}
								{error === 'CredentialsSignin' && 'Invalid credentials.'}
								{!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin'].includes(error) && 'An error occurred. Please try again.'}
							</p>
						</div>
					)}

					<div className="space-y-4">
						<Button
							onClick={() => signIn('google', { callbackUrl })}
							className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold"
							size="lg"
						>
							<Chrome className="w-5 h-5 mr-2" />
							Continue with Google
						</Button>

						<Button
							onClick={() => signIn('github', { callbackUrl })}
							className="w-full h-12 bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 font-semibold"
							size="lg"
						>
							<Github className="w-5 h-5 mr-2" />
							Continue with GitHub
						</Button>
					</div>

					<div className="mt-6 text-center">
						<p className="text-xs text-white/40">
							By signing in, you agree to our Terms of Service and Privacy Policy
						</p>
					</div>
				</motion.div>
			</Container>
		</div>
	);
}
