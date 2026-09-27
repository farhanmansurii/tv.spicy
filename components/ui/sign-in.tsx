import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
		<path fill="var(--color-google-yellow)" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
		<path fill="var(--color-google-red)" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
		<path fill="var(--color-google-green)" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
		<path fill="var(--color-google-blue)" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
	</svg>
);

export interface Testimonial {
	avatarSrc: string;
	name: string;
	handle: string;
	text: string;
}

interface SignInPageProps {
	title?: React.ReactNode;
	description?: React.ReactNode;
	heroImageSrc?: string;
	testimonials?: Testimonial[];
	onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
	onGoogleSignIn?: () => void;
	isLoading?: boolean;
	error?: string | null;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="rounded-md border border-border-strong bg-card transition-colors duration-(--duration-ui) focus-within:border-brand focus-within:ring-2 focus-within:ring-ring/40">
		{children}
	</div>
);

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	return (
		<div className="flex w-64 items-start gap-3 rounded-sm border border-border bg-card p-5">
			<img src={testimonial.avatarSrc} className="h-10 w-10 rounded-2xl object-cover" alt="" />
			<div className="text-sm leading-snug">
				<p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
				<p className="text-muted-foreground">{testimonial.handle}</p>
				<p className="mt-1 text-foreground/80">{testimonial.text}</p>
			</div>
		</div>
	);
}

export const SignInPage: React.FC<SignInPageProps> = ({
	title = <span className="font-light tracking-tighter text-foreground">Welcome</span>,
	description = 'Access your account and continue your journey with us',
	heroImageSrc,
	testimonials = [],
	onSignIn,
	onGoogleSignIn,
	isLoading = false,
	error,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative flex min-h-dvh w-full flex-col bg-(image:--gradient-band) font-sans md:flex-row">
			<section className="flex flex-1 items-center justify-center px-6 py-12 md:p-8">
				<div className="w-full max-w-md">
					<div className="flex flex-col gap-6">
						<h1 className="max-w-full break-words font-display text-display-long leading-none uppercase text-foreground">{title}</h1>
						<p className="max-w-prose text-md leading-relaxed text-muted-foreground">{description}</p>

						{error && (
							<div className="rounded-sm border border-destructive/30 bg-card p-4">
								<p className="text-center font-mono text-xs tracking-meta text-destructive" role="alert">{error}</p>
							</div>
						)}

						<form className="flex flex-col gap-5" onSubmit={onSignIn}>
							<div>
								<label htmlFor="signin-email" className="font-mono text-xs font-medium tracking-label uppercase text-muted-foreground">Email Address</label>
								<GlassInputWrapper>
									<input id="signin-email" name="email" type="email" placeholder="Enter your email address" className="min-h-12 w-full rounded-md bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none" required />
								</GlassInputWrapper>
							</div>

							<div>
								<label htmlFor="signin-password" className="font-mono text-xs font-medium tracking-label uppercase text-muted-foreground">Password</label>
								<GlassInputWrapper>
									<div className="relative">
										<input id="signin-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="min-h-12 w-full rounded-md bg-transparent px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:outline-none" required />
										<button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-2 flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--duration-ui) can-hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</GlassInputWrapper>
							</div>

							<button type="submit" disabled={isLoading} className="min-h-12 w-full rounded-full bg-brand px-5 font-sans text-sm font-semibold text-brand-foreground transition-colors duration-(--duration-ui) can-hover:bg-brand-hover active:scale-97 motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
								{isLoading ? 'Signing in...' : 'Sign In'}
							</button>
						</form>

						<div className="relative flex items-center justify-center">
							<span className="w-full border-t border-border" />
							<span className="absolute bg-background px-4 font-mono text-xs tracking-label uppercase text-muted-foreground">Or continue with</span>
						</div>

						<button type="button" onClick={onGoogleSignIn} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-border-strong bg-card px-5 font-sans text-sm font-semibold text-foreground transition-[color,background-color,border-color] duration-(--duration-ui) can-hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
							<GoogleIcon />
							Continue with Google
						</button>
					</div>
				</div>
			</section>

			{heroImageSrc && (
				<section className="relative hidden flex-1 p-4 md:block">
					<div className="absolute inset-4 overflow-hidden rounded-sm border border-border">
						<img src={heroImageSrc} alt="" className="h-full w-full object-cover object-center" />
					</div>
					{testimonials.length > 0 && (
						<div className="absolute bottom-8 left-1/2 flex w-full -translate-x-1/2 justify-center gap-4 px-8">
							<TestimonialCard testimonial={testimonials[0]} />
							{testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} /></div>}
							{testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} /></div>}
						</div>
					)}
				</section>
			)}
		</div>
	);
};
