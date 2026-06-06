'use client';

/**
 * Reduced-motion handling disabled.
 * Always returns false so animations run at full speed.
 */
export function useReducedMotion(): boolean {
	return false;
}
