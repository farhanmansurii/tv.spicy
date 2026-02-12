'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ShowContainer from './show-container';
import MoreDetailsContainer from './more-details-container';
import ShowDetails from './show-details';
import CastCrewSection from './cast-crew-section';
import VideoSection from './video-section';
import Container from '@/components/shared/containers/container';
import { cn } from '@/lib/utils';
import { isHighIntentNavigation } from '@/lib/utils/scroll-context';
import { ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const MediaDetails = (props: any) => {
	const { data, type, id } = props;
	const mediaId = id || data?.id?.toString();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hasScrolledRef = useRef(false);
	const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
	const synopsis = data?.overview?.trim() || '';
	const releaseDate = data?.first_air_date || data?.release_date || null;
	const releaseLabel = releaseDate
		? new Date(releaseDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
		  })
		: null;
	const languages = Array.isArray(data?.spoken_languages)
		? data.spoken_languages
				.slice(0, 2)
				.map((lang: { english_name?: string; name?: string }) => lang.english_name || lang.name)
				.filter(Boolean)
		: [];

	// Context-aware scroll: Don't scroll to top if coming from Continue Watching
	useEffect(() => {
		const isHighIntent = isHighIntentNavigation(searchParams);

		// Only scroll to top if:
		// 1. Not high-intent navigation (not from Continue Watching)
		// 2. Haven't scrolled yet for this page load
		if (!isHighIntent && !hasScrolledRef.current) {
			hasScrolledRef.current = true;
			// Immediate scroll to top for general navigation
			window.scrollTo(0, 0);
		} else if (isHighIntent) {
			// High-intent: let season-tabs handle scrolling to player
			hasScrolledRef.current = true;
		}
	}, [pathname, searchParams]);

	const handleShare = async () => {
		const title = data?.name || data?.title || 'Media';
		const url = typeof window !== 'undefined' ? window.location.href : '';
		if (!url) return;

		try {
			if (navigator.share) {
				await navigator.share({ title, url });
				toast.success('Shared successfully');
				return;
			}

			await navigator.clipboard.writeText(url);
			toast.success('Link copied');
		} catch (error: unknown) {
			const maybeError = error as { name?: string };
			if (maybeError?.name !== 'AbortError') {
				toast.error('Failed to share');
			}
		}
	};

	return (
		<div className="w-full">
			{/* Hero Banner - Full width on mobile, contained on desktop */}
			<div
				className={cn(
					'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]',
					'md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0'
				)}
			>
				<ShowDetails id={data?.id} show={data} type={type} />
			</div>
			{/* Rest of content in container */}
			<Container className="w-full mt-4 py-6 md:py-8">
				<div className="space-y-10 md:space-y-12">
					<ShowContainer
						showData={data}
						id={data?.id}
						type={type}
						seasons={data.seasons}
					/>
					{mediaId && <CastCrewSection id={mediaId} type={type} />}
					{mediaId && <VideoSection id={mediaId} type={type} />}
					{synopsis && (
						<section
							id="show-details-info"
							className="scroll-mt-24 rounded-[28px] border border-white/10 bg-zinc-950/55 p-5 md:p-7 backdrop-blur-xl"
						>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-300/90">
									Storyline
								</h2>
								<div className="flex items-center gap-2">
									<button
										onClick={handleShare}
										className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-zinc-200 transition-colors hover:bg-white/[0.12] hover:text-white"
										aria-label="Share"
										title="Share"
									>
										<Share2 className="w-4 h-4" strokeWidth={1.8} />
									</button>
								</div>
							</div>
							<div className="relative transition-all duration-300 ease-out">
								<p
									className={cn(
										'text-[17px] leading-[1.55] text-zinc-200/95',
										!isSynopsisExpanded && 'line-clamp-4'
									)}
								>
									{synopsis}
								</p>
								{!isSynopsisExpanded && synopsis.length > 180 && (
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950/95 to-transparent" />
								)}
							</div>
							<div className="mt-5 mb-3 flex flex-wrap gap-2 text-[11px] font-semibold text-zinc-200/90">
								{data?.status && (
									<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
										{data.status}
									</span>
								)}
								{releaseLabel && (
									<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
										{releaseLabel}
									</span>
								)}
								{typeof data?.number_of_seasons === 'number' && data.number_of_seasons > 0 && (
									<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
										{data.number_of_seasons} Seasons
									</span>
								)}
								{typeof data?.number_of_episodes === 'number' && data.number_of_episodes > 0 && (
									<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
										{data.number_of_episodes} Episodes
									</span>
								)}
								{languages.length > 0 && (
									<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
										{languages.join(', ')}
									</span>
								)}
							</div>
							{synopsis.length > 180 && (
								<button
									onClick={() => setIsSynopsisExpanded((prev) => !prev)}
									className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-zinc-300 hover:text-white transition-colors"
								>
									{isSynopsisExpanded ? 'Show less' : 'Read more'}
									{isSynopsisExpanded ? (
										<ChevronUp className="w-3.5 h-3.5 transition-transform duration-200" />
									) : (
										<ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
									)}
								</button>
							)}
						</section>
					)}
					<MoreDetailsContainer type={type} show={data} />
				</div>
			</Container>
		</div>
	);
};
export default MediaDetails;
