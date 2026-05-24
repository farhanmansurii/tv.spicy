import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let isReducedMotion = false;

/**
 * Call once at app boot (e.g. inside a client layout or provider)
 * to make GSAP respect `prefers-reduced-motion: reduce`.
 *
 * When reduced motion is active:
 * - All tween durations become 0 (instant)
 * - ScrollTrigger fires immediately on refresh
 * - Staggers collapse to 0
 */
export function initAccessibleGsap(): void {
	if (typeof window === 'undefined') return;

	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	isReducedMotion = mq.matches;

	applyReducedMotion(isReducedMotion);

	mq.addEventListener('change', (e) => {
		isReducedMotion = e.matches;
		applyReducedMotion(isReducedMotion);
	});
}

function applyReducedMotion(reduce: boolean): void {
	if (reduce) {
		// Make all future tweens instant
		gsap.defaults({ duration: 0, stagger: 0 });
		// Existing tweens: jump to end
		gsap.globalTimeline.timeScale(9999);
		// ScrollTrigger: refresh so triggers fire immediately
		ScrollTrigger.getAll().forEach((st) => st.refresh());
	} else {
		gsap.defaults({ duration: 0.5, stagger: 0.05 });
		gsap.globalTimeline.timeScale(1);
	}
}

/** Utility: returns a GSAP-friendly duration based on reduced-motion state. */
export function safeDuration(normal: number): number {
	return isReducedMotion ? 0 : normal;
}

/** Utility: returns a GSAP-friendly stagger based on reduced-motion state. */
export function safeStagger(normal: number): number {
	return isReducedMotion ? 0 : normal;
}
