'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/**
 * Hook that returns true if the user prefers reduced motion.
 * Wraps Framer Motion's useReducedMotion for consistency.
 */
export function useReducedMotion(): boolean {
	return useFramerReducedMotion() ?? false;
}

/**
 * Returns transition props that respect reduced motion preferences.
 * When reduced motion is preferred, animations are instant (0ms).
 */
export function getAccessibleTransition(
	transition: { duration?: number; delay?: number; ease?: any },
	prefersReducedMotion: boolean
) {
	if (prefersReducedMotion) {
		return {
			...transition,
			duration: 0,
			delay: 0,
		};
	}
	return transition;
}

/**
 * Returns animation props that respect reduced motion preferences.
 * When reduced motion is preferred, the element starts at its final state.
 */
export function getAccessibleAnimation(
	initial: object,
	prefersReducedMotion: boolean
) {
	if (prefersReducedMotion) {
		return {};
	}
	return initial;
}
