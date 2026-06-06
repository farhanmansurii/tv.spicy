'use client';

/**
 * Accessibility provider — reduced-motion handling disabled.
 * All animations run at full speed regardless of OS preference.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
