'use client';

import { useEffect, useState } from 'react';

/**
 * Detects the user's `prefers-reduced-motion` OS setting.
 * Returns `true` when the user has requested minimal motion
 * (accessibility → motion → reduce motion on iOS/macOS).
 */
export function useReducedMotion(): boolean {
	const [reduced, setReduced] = useState<boolean>(false);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		setReduced(mq.matches);

		const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	return reduced;
}
