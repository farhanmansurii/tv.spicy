'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import RelatedShowsContainer from './related-shows-container';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MoreDetailsContainerProps {
	type: string;
	similar: any[];
	recommendations: any[];
}

function MoreDetailsContainerComponent({ type, similar, recommendations }: MoreDetailsContainerProps) {
	const [selected, setSelected] = useState<'related' | 'recommendations'>('related');

	const sectionRef = useRef<HTMLElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const relatedPanelRef = useRef<HTMLDivElement>(null);
	const recsPanelRef = useRef<HTMLDivElement>(null);

	const handleTabChange = useCallback((val: 'related' | 'recommendations') => {
		if (val === selected) return;

		const outgoing = val === 'related' ? recsPanelRef.current : relatedPanelRef.current;
		const incoming = val === 'related' ? relatedPanelRef.current : recsPanelRef.current;

		if (outgoing && incoming) {
			const tl = gsap.timeline();
			tl.to(outgoing, {
				opacity: 0,
				y: -8,
				duration: 0.25,
				ease: 'power2.in',
				onComplete: () => {
					gsap.set(outgoing, { display: 'none' });
					gsap.set(incoming, { display: 'block', opacity: 0, y: 12 });
					gsap.to(incoming, {
						opacity: 1,
						y: 0,
						duration: 0.35,
						ease: 'power2.out',
					});
				},
			});
		}

		setSelected(val);
	}, [selected]);

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
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	if (!similar.length && !recommendations.length) return null;

	return (
		<section ref={sectionRef} className="section-spacing">
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				{/* Header with Tabs */}
				<div ref={headerRef} className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-6">
					<h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
						More to Watch
					</h2>
					<div className="flex items-center gap-1 bg-white/[0.06] rounded-full p-1 flex-shrink-0">
						<button
							onClick={() => handleTabChange('related')}
							className={`relative px-4 py-1.5 text-xs md:text-sm font-medium rounded-full transition-all duration-300 ease-cinematic ${
								selected === 'related'
									? 'text-white bg-white/15'
									: 'text-white/40 hover:text-white/70'
							}`}
						>
							Similar
						</button>
						<button
							onClick={() => handleTabChange('recommendations')}
							className={`relative px-4 py-1.5 text-xs md:text-sm font-medium rounded-full transition-all duration-300 ease-cinematic ${
								selected === 'recommendations'
									? 'text-white bg-white/15'
									: 'text-white/40 hover:text-white/70'
							}`}
						>
							For You
						</button>
					</div>
				</div>

				{/* Tab Content */}
				<div className="relative">
					{similar.length > 0 && (
						<div
							ref={relatedPanelRef}
							style={{ display: selected === 'related' ? 'block' : 'none' }}
						>
							<RelatedShowsContainer type={type as 'movie' | 'tv'} items={similar} />
						</div>
					)}
					{recommendations.length > 0 && (
						<div
							ref={recsPanelRef}
							style={{ display: selected === 'recommendations' ? 'block' : 'none' }}
						>
							<RelatedShowsContainer type={type as 'movie' | 'tv'} items={recommendations} />
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

export default memo(MoreDetailsContainerComponent);
MoreDetailsContainerComponent.displayName = 'MoreDetailsContainer';
