'use client';

/**
 * Reduced-motion handling disabled.
 * All animations run at full speed regardless of OS preference.
 */

export function useReducedMotion(): boolean {
	return false;
}

export function getAccessibleTransition(
	transition: { duration?: number; delay?: number; ease?: any }
) {
	return transition;
}

export function getAccessibleAnimation(initial: object) {
	return initial;
}
