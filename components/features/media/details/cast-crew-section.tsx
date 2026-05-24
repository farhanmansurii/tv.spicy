'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { tmdbImage } from '@/lib/tmdb-image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CastMember {
	id: number;
	name: string;
	character?: string;
	profile_path?: string | null;
}

interface CastCrewSectionProps {
	credits: { cast?: CastMember[] };
}

function CastCrewSectionComponent({ credits }: CastCrewSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLUListElement>(null);
	const hasAnimated = useRef(false);

	const cast = credits?.cast || [];
	const displayedCast = isExpanded ? cast : cast.slice(0, 8);

	/* ── ScrollTrigger Entrance ── */
	useEffect(() => {
		if (!sectionRef.current) return;

		const ctx = gsap.context(() => {
			// Header entrance
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

			// Grid cards stagger entrance
			if (gridRef.current) {
				const cards = gridRef.current.querySelectorAll('[data-cast-card]');
				gsap.fromTo(
					cards,
					{ y: 40, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.7,
						stagger: 0.06,
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

		const cards = gridRef.current.querySelectorAll('[data-cast-card]');
		// Animate only the last N cards that were just added
		const newCards = Array.from(cards).slice(8);
		if (newCards.length > 0) {
			gsap.fromTo(
				newCards,
				{ y: 30, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' }
			);
		}
	}, [displayedCast.length]);

	if (!cast.length) return null;

	return (
		<section ref={sectionRef} className="section-spacing">
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div ref={headerRef} className="flex items-center justify-between mb-5 md:mb-6">
					<div className="flex items-baseline gap-3">
						<h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
							Cast & Crew
						</h2>
						<span className="text-xs md:text-sm text-white/40 font-medium">
							{isExpanded ? 'Full cast list' : 'Top billed cast'}
						</span>
					</div>
					<button
						onClick={() => setIsExpanded((p) => !p)}
						aria-expanded={isExpanded}
						className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-white/50 hover:text-white/80 transition-colors duration-200"
					>
						{isExpanded ? (
							<>
								Show less <CaretUpIcon size={14} />
							</>
						) : (
							<>
								All {cast.length} <CaretDownIcon size={14} />
							</>
						)}
					</button>
				</div>

				{/* Cast Grid */}
				<ul ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8">
					{displayedCast.map((actor) => (
						<li key={actor.id} data-cast-card className="group">
							<div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 mb-2.5 md:mb-3 will-change-transform transition-transform duration-500 ease-spring group-hover:scale-[1.04]">
								{actor.profile_path ? (
									<Image
										src={tmdbImage(actor.profile_path, 'w185')}
										alt={actor.name}
										fill
										loading="lazy"
										sizes="150px"
										className="object-cover transition-opacity duration-300"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-medium">
										No image
									</div>
								)}
							</div>
							<h3 className="text-xs md:text-sm font-semibold text-white truncate tracking-tight">
								{actor.name}
							</h3>
							<p className="text-[11px] md:text-xs text-white/40 truncate mt-0.5">
								{actor.character}
							</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

export default memo(CastCrewSectionComponent);
CastCrewSectionComponent.displayName = 'CastCrewSection';
