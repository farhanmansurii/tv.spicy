'use client';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import Container from '@/components/shared/containers/container';

const GitHubIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
	<svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 1.667c-4.605 0-8.334 3.823-8.334 8.544 0 3.78 2.385 6.974 5.698 8.106.417.075.573-.182.573-.406 0-.203-.011-.875-.011-1.592-2.093.397-2.635-.522-2.802-1.002-.094-.246-.5-1.005-.854-1.207-.291-.16-.708-.556-.01-.567.656-.01 1.124.62 1.281.876.75 1.292 1.948.93 2.427.705.073-.555.291-.93.531-1.143-1.854-.213-3.791-.95-3.791-4.218 0-.929.322-1.698.854-2.296-.083-.214-.375-1.09.083-2.265 0 0 .698-.224 2.292.876a7.576 7.576 0 0 1 2.083-.288c.709 0 1.417.096 2.084.288 1.593-1.11 2.291-.875 2.291-.875.459 1.174.167 2.05.084 2.263.53.599.854 1.357.854 2.297 0 3.278-1.948 4.005-3.802 4.219.302.266.563.78.563 1.58 0 1.143-.011 2.061-.011 2.35 0 .224.156.491.573.405a8.365 8.365 0 0 0 4.11-3.116 8.707 8.707 0 0 0 1.567-4.99c0-4.721-3.73-8.545-8.334-8.545Z"
		/>
	</svg>
);

const XIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
	<svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

const SocialLink = ({
	href,
	icon: Icon,
	children,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) => {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="group p-2 -m-2 rounded-full hover:bg-zinc-800 transition-colors"
		>
			<span className="sr-only">{children}</span>
			{/* Changed fill colors to match dark theme better */}
			<Icon className="h-5 w-5 fill-zinc-400 transition group-hover:fill-white" />
		</a>
	);
};

const Footer = () => {
	return (
		<footer className="w-full mt-16">
			<div className="px-4 md:px-12">
				<Separator className="bg-zinc-800/50" />
			</div>

			<Container className="py-12 flex flex-col gap-8">
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex items-center gap-2">
						<span className="text-xl font-bold tracking-tighter text-white">
							Watch.
						</span>
					</div>

					<div className="flex items-center gap-6">
						<SocialLink href="https://github.com" icon={GitHubIcon}>
							GitHub
						</SocialLink>
						<SocialLink href="https://twitter.com" icon={XIcon}>
							X (Twitter)
						</SocialLink>
					</div>
				</div>

				<div className="max-w-3xl mx-auto text-center">
					<p className="text-sm text-zinc-500 leading-relaxed">
						Disclaimer: This site does not store any files on its server. All contents
						are provided by non-affiliated third parties.
						<br className="hidden md:block" />
						<span className="text-zinc-600 italic">
							Don&apos;t forget to clear your browser history before you die.
						</span>
					</p>
				</div>

				<div className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600 pt-8 mt-4 border-t border-zinc-900/50">
					<p>Copyright © {new Date().getFullYear()} Watch. All rights reserved.</p>
					<div className="flex gap-4 mt-2 md:mt-0">
						<a href="#" className="hover:text-zinc-400 transition-colors">
							Privacy Policy
						</a>
						<a href="#" className="hover:text-zinc-400 transition-colors">
							Terms of Service
						</a>
					</div>
				</div>
			</Container>
		</footer>
	);
};

export default Footer;
