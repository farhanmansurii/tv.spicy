/**
 * Reduced-motion handling disabled.
 * All animations run at full speed regardless of OS preference.
 */

export function initAccessibleGsap(): void {
	// No-op: animations always enabled
}

export function safeDuration(normal: number): number {
	return normal;
}

export function safeStagger(normal: number): number {
	return normal;
}
