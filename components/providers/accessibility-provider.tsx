'use client';

import { useEffect } from 'react';
import { initAccessibleGsap } from '@/lib/gsap-accessible';

/**
 * Initializes accessibility features at app boot:
 * - Respects `prefers-reduced-motion` for GSAP animations
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		initAccessibleGsap();
	}, []);

	return <>{children}</>;
}
