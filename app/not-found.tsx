'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ErrorPage({ error }) {
	const [errorCode, setErrorCode] = useState('404');
	const [errorMessage, setErrorMessage] = useState('Page Not Found');

	useEffect(() => {
		if (error) {
			setErrorCode(error.statusCode || '500');
			setErrorMessage(error.message || 'Internal Server Error');
		}
	}, [error]);

	const handleHardReload = () => {
		window.location.reload(true);
	};

	return (
		<div className="flex items-center justify-center p-4">
			<Card className="w-full max-w-md overflow-hidden shadow-xl">
				<div className="relative h-40 bg-primary">
					<div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
					<div className="absolute inset-0 flex items-center justify-center">
						<AlertCircle className="w-20 h-20 text-primary-foreground animate-pulse" />
					</div>
				</div>
				<CardContent className="p-6 border-0 text-center">
					<h1 className="text-4xl font-bold text-primary mb-2">{errorCode}</h1>
					<p className="text-xl text-muted-foreground mb-6">{errorMessage}</p>
					<p className="text-sm text-muted-foreground mb-8">
						We apologize for the inconvenience. Please try reloading the page or return
						to the homepage.
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Button
							variant="outline"
							size="lg"
							className="w-full group"
							onClick={handleHardReload}
						>
							<RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
							Reload Page
						</Button>
						<Link href="/" className="sm:col-start-2">
							<Button variant="default" size="lg" className="w-full group">
								<svg
									className="mr-2 h-4 w-4 group-hover:scale-105"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g fill="currentColor">
										<path
											d="M17 21H7a2 2 0 0 1-2-2v-9l7-7l7 7v9a2 2 0 0 1-2 2"
											opacity=".16"
										/>
										<path d="M20 10a1 1 0 1 0-2 0zM6 10a1 1 0 0 0-2 0zm14.293 2.707a1 1 0 0 0 1.414-1.414zM12 3l.707-.707a1 1 0 0 0-1.414 0zm-9.707 8.293a1 1 0 1 0 1.414 1.414zM7 22h10v-2H7zm13-3v-9h-2v9zM6 19v-9H4v9zm15.707-7.707l-9-9l-1.414 1.414l9 9zm-10.414-9l-9 9l1.414 1.414l9-9zM17 22a3 3 0 0 0 3-3h-2a1 1 0 0 1-1 1zM7 20a1 1 0 0 1-1-1H4a3 3 0 0 0 3 3z" />
									</g>
								</svg>
								Homepage
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
