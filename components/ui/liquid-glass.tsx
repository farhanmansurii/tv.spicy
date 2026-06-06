'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
	className?: string;
	children?: React.ReactNode;
	/** Background white-tint opacity (0–1). Default 0.09. */
	tint?: number;
	/** Blur radius in px. Default 28. */
	blur?: number;
	/** Saturation percentage. Default 180. */
	saturate?: number;
}

/**
 * LiquidGlass — a high-fidelity glass surface with true refraction.
 *
 * Architecture (bottom → top):
 *  1. Base blur + tint — works in every modern browser.
 *  2. Displacement refraction — additive via feTurbulence + feDisplacementMap.
 *     Chromium applies url() inside backdrop-filter; Safari/Firefox fall back
 *     to the base layer because it sits underneath.
 *  3. Edge light-catch — bright top rim, dark bottom rim.
 *  4. Surface light gradient — curved-lens caustic simulation.
 *  5. Cool tint overlay — subtle blue-shift for liquid feel.
 *  6. Noise grain — microscopic surface texture.
 *
 * No <style> tags, no oklch(from…). 100 % inline styles.
 */
export function LiquidGlass({
	className,
	children,
	tint = 0.09,
	blur = 28,
	saturate = 180,
}: LiquidGlassProps) {
	const id = React.useId().replace(/:/g, '');

	return (
		<div className={cn('relative isolate', className)}>
			{/* ── Layer 1: Base blur + tint (guaranteed to work) ── */}
			<div
				className="absolute inset-0 -z-40"
				style={{
					backgroundColor: `rgba(255, 255, 255, ${tint})`,
					backdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
					WebkitBackdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
				}}
			/>

			{/* ── Layer 2: Displacement refraction (additive, Chromium-only) ── */}
			<svg
				className="pointer-events-none absolute h-0 w-0 overflow-hidden"
				aria-hidden="true"
			>
				<filter id={`lg-disp-${id}`} primitiveUnits="objectBoundingBox">
					{/* Procedural displacement map — seamless fractal noise */}
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.018"
						numOctaves="5"
						seed={7}
						result="noise"
					/>
					{/* Keep noise in [0,1] with 0.5 neutral; compress slightly for subtlety */}
					<feColorMatrix
						type="matrix"
						values="0.6 0 0 0 0.2  0 0.6 0 0 0.2  0 0 0.6 0 0.2  0 0 0 1 0"
						in="noise"
						result="map"
					/>
					<feGaussianBlur
						in="SourceGraphic"
						stdDeviation="0.006"
						result="blur"
					/>
					<feDisplacementMap
						in="blur"
						in2="map"
						scale="0.06"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>
			</svg>
			<div
				className="absolute inset-0 -z-30"
				style={{
					backdropFilter: `blur(${blur}px) url(#lg-disp-${id}) saturate(${saturate}%)`,
					WebkitBackdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
				}}
			/>

			{/* ── Layer 3: Edge light-catch (glass rim) ── */}
			<div
				className="pointer-events-none absolute inset-0 -z-20"
				style={{
					boxShadow:
						'inset 0 1px 0 0 rgba(255,255,255,0.18), inset 0 -1.5px 0 0 rgba(0,0,0,0.25), inset 1px 0 0 0 rgba(255,255,255,0.05), inset -1px 0 0 0 rgba(255,255,255,0.05)',
				}}
			/>

			{/* ── Layer 4: Surface light gradient (curved-lens caustic) ── */}
			<div
				className="pointer-events-none absolute inset-0 -z-20"
				style={{
					background: `
						radial-gradient(ellipse 140% 60% at 50% 0%, rgba(255,255,255,0.14) 0%, transparent 55%),
						linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(0,0,0,0.08) 100%)
					`,
				}}
			/>

			{/* ── Layer 5: Cool liquid tint (subtle blue shift) ── */}
			<div
				className="pointer-events-none absolute inset-0 -z-10"
				style={{
					background:
						'radial-gradient(ellipse 80% 40% at 65% 25%, rgba(180,210,255,0.04) 0%, transparent 60%)',
					mixBlendMode: 'screen',
				}}
			/>

			{/* ── Layer 6: Noise grain ── */}
			<svg
				className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.035]"
				aria-hidden="true"
				preserveAspectRatio="none"
			>
				<filter id={`lg-noise-${id}`}>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.8"
						numOctaves="3"
						stitchTiles="stitch"
					/>
				</filter>
				<rect width="100%" height="100%" filter={`url(#lg-noise-${id})`} />
			</svg>

			{children}
		</div>
	);
}
