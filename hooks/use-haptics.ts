'use client';

import { useCallback, useEffect, useRef } from 'react';

type HapticPattern =
	| 'light'
	| 'medium'
	| 'heavy'
	| 'soft'
	| 'rigid'
	| 'selection'
	| 'success'
	| 'warning'
	| 'error'
	| 'nudge'
	| 'buzz';

/**
 * Thin hook over web-haptics.
 * - SSR-safe: only loads the library on the client.
 * - Graceful: if Vibration API is unavailable (desktop), all calls are no-ops.
 * - Returns a stable `haptic(pattern)` function — safe to pass as a dependency.
 */
export function useHaptics() {
	const instanceRef = useRef<any>(null);

	useEffect(() => {
		let mounted = true;

		import('web-haptics').then(({ WebHaptics }) => {
			if (mounted) instanceRef.current = new WebHaptics();
		});

		return () => {
			mounted = false;
			instanceRef.current?.destroy?.();
			instanceRef.current = null;
		};
	}, []);

	const haptic = useCallback((pattern: HapticPattern = 'light') => {
		const instance = instanceRef.current;
		if (!instance) return;

		import('web-haptics').then(({ defaultPatterns }) => {
			const p = defaultPatterns[pattern];
			if (p) instance.trigger(p.pattern);
		});
	}, []);

	return haptic;
}
