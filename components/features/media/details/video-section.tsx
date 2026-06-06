'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { PlayIcon, XIcon, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Video {
	key: string;
	name: string;
	id: string;
	type: string;
	site: string;
}

interface ImageItem {
	file_path: string;
}

interface VideoSectionProps {
	videos: Video[];
	images?: { backdrops?: ImageItem[] };
}

function VideoSectionComponent({ videos, images }: VideoSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [activeVideo, setActiveVideo] = useState<string | null>(null);

	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLUListElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const modalContentRef = useRef<HTMLDivElement>(null);
	const hasAnimated = useRef(false);

	const backdrops = images?.backdrops || [];

	const allItems = [
		...videos.map((v) => ({
			type: 'video' as const,
			key: v.key,
			id: v.id,
			name: v.name,
			poster: `https://img.youtube.com/vi/${v.key}/mqdefault.jpg`,
		})),
		...backdrops.map((img, i) => ({
			type: 'image' as const,
			id: `img-${i}`,
			name: 'Image',
			poster: `https://image.tmdb.org/t/p/w780${img.file_path}`,
		})),
	];

	const displayed = isExpanded ? allItems : allItems.slice(0, 5);

	/* ── ScrollTrigger Entrance ── */
	useEffect(() => {
		if (!sectionRef.current) return;

		const ctx = gsap.context(() => {
			if (headerRef.current) {
				gsap.fromTo(
					headerRef.current,
					{ y: 24, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.8,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: headerRef.current,
							start: 'top 85%',
							toggleActions: 'play none none none',
						},
					}
				);
			}

			if (gridRef.current) {
				const items = gridRef.current.querySelectorAll('[data-video-card]');
				gsap.fromTo(
					items,
					{ y: 40, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.7,
						stagger: 0.08,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: gridRef.current,
							start: 'top 85%',
							toggleActions: 'play none none none',
						},
					}
				);
			}
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	/* ── Animate newly revealed cards on expand ── */
	useEffect(() => {
		if (!gridRef.current || !hasAnimated.current) {
			hasAnimated.current = true;
			return;
		}
		const items = gridRef.current.querySelectorAll('[data-video-card]');
		const newItems = Array.from(items).slice(5);
		if (newItems.length > 0) {
			gsap.fromTo(
				newItems,
				{ y: 30, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }
			);
		}
	}, [displayed.length]);

	/* ── Modal Open / Close Animation ── */
	useEffect(() => {
		if (!modalRef.current || !modalContentRef.current) return;

		const ctx = gsap.context(() => {
			if (activeVideo) {
				// Open
				gsap.fromTo(
					modalRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.35, ease: 'power2.out' }
				);
				gsap.fromTo(
					modalContentRef.current,
					{ scale: 0.92, opacity: 0, y: 20 },
					{ scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.2)', delay: 0.05 }
				);
			}
		});

		return () => ctx.revert();
	}, [activeVideo]);

	if (!allItems.length) return null;

	const closeModal = () => {
		if (!modalRef.current || !modalContentRef.current) {
			setActiveVideo(null);
			return;
		}
		const tl = gsap.timeline({
			onComplete: () => setActiveVideo(null),
		});
		tl.to(modalContentRef.current, {
			scale: 0.95,
			opacity: 0,
			y: 10,
			duration: 0.25,
			ease: 'power2.in',
		});
		tl.to(
			modalRef.current,
			{ opacity: 0, duration: 0.2, ease: 'power2.in' },
			0.1
		);
	};

	return (
		<section ref={sectionRef} className="section-spacing">
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div ref={headerRef} className="flex items-center justify-between mb-5 md:mb-6">
					<div className="flex items-baseline gap-3">
						<h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
							Trailers & More
						</h2>
						<span className="text-xs md:text-sm text-white/40 font-medium">
							{videos.length} videos · {backdrops.length} images
						</span>
					</div>
					{allItems.length > 5 && (
						<button
							onClick={() => setIsExpanded((p) => !p)}
							className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-white/50 hover:text-white/80 transition-colors duration-200"
						>
							{isExpanded ? (
								<>
									Show less <CaretUpIcon size={14} />
								</>
							) : (
								<>
									Show all <CaretDownIcon size={14} />
								</>
							)}
						</button>
					)}
				</div>

				{/* Video Grid */}
				<ul ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
					{displayed.map((item) => (
						<li key={item.id} data-video-card className="group">
							{item.type === 'video' ? (
								<button
									onClick={() => setActiveVideo(item.key!)}
									className="relative w-full aspect-video overflow-hidden rounded-2xl bg-white/5 will-change-transform transition-transform duration-500 ease-spring group-hover:scale-[1.04]"
								>
									<img
										src={item.poster}
										alt={item.name}
										loading="lazy"
										className="h-full w-full object-cover"
									/>
									{/* Play overlay */}
									<div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-300">
										<div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 ease-spring">
											<PlayIcon size={20} weight="fill" className="text-white ml-0.5" />
										</div>
									</div>
								</button>
							) : (
								<div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-white/5 will-change-transform transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
									<img
										src={item.poster}
										alt="Backdrop"
										loading="lazy"
										className="h-full w-full object-cover"
									/>
								</div>
							)}
							<p className="mt-2 text-xs md:text-sm text-white/60 truncate font-medium">
								{item.name}
							</p>
						</li>
					))}
				</ul>
			</div>

			{/* Video Modal */}
			{activeVideo && (
				<div
					ref={modalRef}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
					onClick={closeModal}
				>
					<div
						ref={modalContentRef}
						className="relative w-full max-w-5xl mx-4 aspect-video"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={closeModal}
							className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors duration-200"
						>
							<XIcon size={16} />
							Close
						</button>
						<iframe
							src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
							title="Trailer"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="w-full h-full rounded-2xl"
						/>
					</div>
				</div>
			)}
		</section>
	);
}

export default memo(VideoSectionComponent);
VideoSectionComponent.displayName = 'VideoSection';
