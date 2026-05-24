'use client';

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { ShareNetworkIcon, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StorylineSectionProps {
	data: any;
	type: 'movie' | 'tv';
	credits?: { crew?: { job: string; name: string }[] } | null;
}

function StorylineSectionComponent({ data, type, credits }: StorylineSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const synopsis = data?.overview?.trim() || '';

	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const synopsisRef = useRef<HTMLParagraphElement>(null);
	const pillsRef = useRef<HTMLDivElement>(null);

	const releaseDate = data?.first_air_date || data?.release_date || null;
	const releaseLabel = releaseDate
		? new Date(releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
		: null;

	const languages = Array.isArray(data?.spoken_languages)
		? data.spoken_languages
				.slice(0, 2)
				.map((lang: any) => lang.english_name || lang.name)
				.filter(Boolean)
		: [];

	const handleShare = useCallback(async () => {
		const title = data?.name || data?.title || 'Media';
		const url = typeof window !== 'undefined' ? window.location.href : '';
		if (!url) return;
		try {
			if (navigator.share) {
				await navigator.share({ title, url });
				toast.success('Shared successfully');
			} else {
				await navigator.clipboard.writeText(url);
				toast.success('Link copied');
			}
		} catch (error: any) {
			if (error?.name !== 'AbortError') toast.error('Failed to share');
		}
	}, [data]);

	/* ── ScrollTrigger Entrance ── */
	useEffect(() => {
		if (!sectionRef.current) return;

		const ctx = gsap.context(() => {
			if (headerRef.current) {
				gsap.fromTo(
					headerRef.current,
					{ y: 20, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.7,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: headerRef.current,
							start: 'top 88%',
							toggleActions: 'play none none none',
						},
					}
				);
			}

			if (synopsisRef.current) {
				gsap.fromTo(
					synopsisRef.current,
					{ y: 24, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: synopsisRef.current,
							start: 'top 88%',
							toggleActions: 'play none none none',
						},
					}
				);
			}

			if (pillsRef.current) {
				const pills = pillsRef.current.querySelectorAll('[data-pill]');
				gsap.fromTo(
					pills,
					{ scale: 0.9, opacity: 0, y: 10 },
					{
						scale: 1,
						opacity: 1,
						y: 0,
						duration: 0.5,
						stagger: 0.04,
						ease: 'back.out(1.4)',
						scrollTrigger: {
							trigger: pillsRef.current,
							start: 'top 88%',
							toggleActions: 'play none none none',
						},
					}
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	/* ── Smooth expand/collapse animation ── */
	useEffect(() => {
		if (!synopsisRef.current) return;
		if (synopsis.length <= 180) return;

		gsap.to(synopsisRef.current, {
			duration: 0.4,
			ease: 'power2.out',
		});
	}, [isExpanded, synopsis.length]);

	if (!synopsis) return null;

	const director =
		type === 'movie' && credits?.crew
			? credits.crew.find((c: any) => c.job === 'Director')
			: null;

	return (
		<section ref={sectionRef} className="section-spacing">
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div ref={headerRef} className="flex items-center justify-between mb-5 md:mb-6">
					<h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
						Storyline
					</h2>
					<button
						onClick={handleShare}
						className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white px-4 py-2 text-xs font-medium backdrop-blur-md transition-all duration-300 ease-cinematic active:scale-95"
						aria-label="Share"
					>
						<ShareNetworkIcon size={14} />
						Share
					</button>
				</div>

				{/* Synopsis */}
				<p
					ref={synopsisRef}
					className={`text-sm md:text-base text-white/60 leading-relaxed max-w-3xl transition-all duration-500 ease-cinematic ${
						isExpanded ? '' : 'line-clamp-3'
					}`}
				>
					{synopsis}
				</p>

				{/* Read More Toggle */}
				{synopsis.length > 180 && (
					<button
						onClick={() => setIsExpanded((p) => !p)}
						className="inline-flex items-center gap-1 mt-3 text-xs md:text-sm font-medium text-[#0A84FF] hover:text-[#0A84FF]/80 transition-colors duration-200"
					>
						{isExpanded ? (
							<>
								Show less <CaretUpIcon size={14} />
							</>
						) : (
							<>
								Read more <CaretDownIcon size={14} />
							</>
						)}
					</button>
				)}

				{/* Pills */}
				<div ref={pillsRef} className="flex flex-wrap gap-2 mt-5 md:mt-6">
					{Array.isArray(data?.created_by) && data.created_by.length > 0 && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							Created by{' '}
							{data.created_by
								.slice(0, 2)
								.map((c: any) => c.name)
								.join(' & ')}
						</span>
					)}
					{director && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							Directed by {director.name}
						</span>
					)}
					{data?.status && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							{data.status}
						</span>
					)}
					{releaseLabel && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							{releaseLabel}
						</span>
					)}
					{typeof data?.number_of_seasons === 'number' && data.number_of_seasons > 0 && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							{data.number_of_seasons} Seasons
						</span>
					)}
					{typeof data?.number_of_episodes === 'number' && data.number_of_episodes > 0 && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							{data.number_of_episodes} Episodes
						</span>
					)}
					{languages.length > 0 && (
						<span data-pill className="inline-flex items-center rounded-full bg-white/[0.08] text-white/70 px-3 py-1.5 text-xs font-medium">
							{languages.join(', ')}
						</span>
					)}
				</div>
			</div>
		</section>
	);
}

export default memo(StorylineSectionComponent);
StorylineSectionComponent.displayName = 'StorylineSection';
