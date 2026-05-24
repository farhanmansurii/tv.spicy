'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const GitHubIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
	<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 1.667c-4.605 0-8.334 3.823-8.334 8.544 0 3.78 2.385 6.974 5.698 8.106.417.075.573-.182.573-.406 0-.203-.011-.875-.011-1.592-2.093.397-2.635-.522-2.802-1.002-.094-.246-.5-1.005-.854-1.207-.291-.16-.708-.556-.01-.567.656-.01 1.124.62 1.281.876.75 1.292 1.948.93 2.427.705.073-.555.291-.93.531-1.143-1.854-.213-3.791-.95-3.791-4.218 0-.929.322-1.698.854-2.296-.083-.214-.375-1.09.083-2.265 0 0 .698-.224 2.292.876a7.576 7.576 0 0 1 2.083-.288c.709 0 1.417.096 2.084.288 1.593-1.11 2.291-.875 2.291-.875.459 1.174.167 2.05.084 2.263.53.599.854 1.357.854 2.297 0 3.278-1.948 4.005-3.802 4.219.302.266.563.78.563 1.58 0 1.143-.011 2.061-.011 2.35 0 .224.156.491.573.405a8.365 8.365 0 0 0 4.11-3.116 8.707 8.707 0 0 0 1.567-4.99c0-4.721-3.73-8.545-8.334-8.545Z"
		/>
	</svg>
);

const XIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

const LEGAL_LINKS = [
	{ label: 'Privacy', href: '#' },
	{ label: 'Terms', href: '#' },
	{ label: 'DMCA', href: '#' },
];

const NAV_LINKS = [
	{ label: 'Home', href: '/' },
	{ label: 'Movies', href: '/movie' },
	{ label: 'TV Series', href: '/tv' },
	{ label: 'Library', href: '/library' },
];

export default function Footer() {
	return (
		<footer className="w-full mt-20 pb-8">
			{/* Shared max-w-7xl container — identical to header and all page containers */}
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">

				{/* Full-width rule */}
				<div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />

				{/* Main footer body */}
				<div className="pt-10 pb-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start">

					{/* Left — brand block */}
					<div className="flex flex-col gap-4 max-w-sm">
						<Link href="/" className="flex items-center gap-2 w-fit group" aria-label="Spicy TV home">
							<div className="relative h-7 w-7 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
								<Image src="/logo.webp" alt="" fill className="object-contain" sizes="28px" />
							</div>
							<span
								className="text-[15px] font-semibold tracking-tight text-white/80 group-hover:text-white transition-colors duration-200"
								style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
							>
								Spicy TV
							</span>
						</Link>

						<p className="text-[12px] leading-relaxed text-zinc-500 max-w-xs">
							This site does not store any files on its server. All contents are provided
							by non-affiliated third parties.
						</p>

						<p className="text-[11px] text-zinc-600 italic">
							Don&apos;t forget to clear your browser history before you die.
						</p>
					</div>

					{/* Right — nav + socials stacked */}
					<div className="flex flex-col gap-6 items-start md:items-end">
						{/* Nav links */}
						<nav aria-label="Footer navigation">
							<ul className="flex flex-wrap gap-x-5 gap-y-2">
								{NAV_LINKS.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-[13px] font-medium text-zinc-500 hover:text-white transition-colors duration-150"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>

						{/* Social icons */}
						<div className="flex items-center gap-3">
							<a
								href="https://github.com"
								target="_blank"
								rel="noreferrer"
								aria-label="GitHub"
								className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-white transition-all duration-150 hover:bg-white/[0.06]"
							>
								<GitHubIcon className="w-4 h-4" />
							</a>
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noreferrer"
								aria-label="X (Twitter)"
								className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-white transition-all duration-150 hover:bg-white/[0.06]"
							>
								<XIcon className="w-4 h-4" />
							</a>
						</div>
					</div>
				</div>

				{/* Bottom bar */}
				<div
					className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-5"
					style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
				>
					<p className="text-[11px] text-zinc-600 tabular-nums">
						© {new Date().getFullYear()} Spicy TV
					</p>

					<ul className="flex items-center gap-4">
						{LEGAL_LINKS.map((link) => (
							<li key={link.label}>
								<a
									href={link.href}
									className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors duration-150"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>

			</div>
		</footer>
	);
}
