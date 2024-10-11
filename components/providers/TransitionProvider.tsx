'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { TransitionRouter } from 'next-transition-router';

export function TransitionProviders({ children }: { children: React.ReactNode }) {
	const firstLayer = useRef<HTMLDivElement | null>(null);
	const secondLayer = useRef<HTMLDivElement | null>(null);

	return (
		<TransitionRouter
			auto={true}
			leave={(next, from, to) => {
				const tl = gsap
					.timeline({
						onComplete: next,
					})
					.fromTo(
						firstLayer.current,
						{ y: '100%' },
						{
							y: 0,
							duration: 0.5,
							ease: 'circ.inOut',
						}
					)
					.fromTo(
						secondLayer.current,
						{
							y: '100%',
						},
						{
							y: 0,
							duration: 0.5,
							ease: 'circ.inOut',
						},
						'<50%'
					);

				return () => {
					tl.kill();
				};
			}}
			enter={(next) => {
				const tl = gsap
					.timeline()
					.fromTo(
						secondLayer.current,
						{ y: 0 },
						{
							y: '-100%',
							duration: 0.5,
							ease: 'circ.inOut',
						}
					)
					.fromTo(
						firstLayer.current,
						{ y: 0 },
						{
							y: '-100%',
							duration: 0.5,
							ease: 'circ.inOut',
						},
						'<50%'
					)
					.call(next, undefined, '<50%');

				return () => {
					tl.kill();
				};
			}}
		>
			<main>{children}</main>

			<div
				ref={firstLayer}
				className="fixed inset-0 z-50 translate-y-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
			/>
		</TransitionRouter>
	);
}
