/**
 * Scroll Context Utilities
 * Detects user intent and manages context-aware scrolling behavior
 */

export type ScrollIntent = 'high-intent' | 'browsing' | 'navigation';

/**
 * Detects if user is navigating from Continue Watching (high intent to watch)
 */
export function isHighIntentNavigation(searchParams: URLSearchParams): boolean {
	return searchParams.has('season') && searchParams.has('episode');
}

/**
 * Detects if user is already on the details page (browsing context)
 */
export function isBrowsingContext(pathname: string, currentPathname: string): boolean {
	return pathname === currentPathname;
}

/**
 * Determines scroll intent based on context
 */
export function getScrollIntent(
	searchParams: URLSearchParams,
	pathname: string,
	currentPathname: string,
	isInitialLoad: boolean
): ScrollIntent {
	if (isInitialLoad && isHighIntentNavigation(searchParams)) {
		return 'high-intent';
	}
	if (isBrowsingContext(pathname, currentPathname)) {
		return 'browsing';
	}
	return 'navigation';
}

/**
 * Smooth scroll with single-scroll rule (prevents multiple simultaneous scrolls)
 */
let isScrolling = false;
let scrollTimeout: NodeJS.Timeout | null = null;

export function smoothScrollTo(
	element: HTMLElement | null,
	options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' },
	duration: number = 500
): void {
	if (!element || isScrolling) {
		return;
	}

	// Clear any pending scrolls
	if (scrollTimeout) {
		clearTimeout(scrollTimeout);
	}

	isScrolling = true;

	// Perform scroll
	element.scrollIntoView(options);

	// Reset scrolling flag after animation completes
	scrollTimeout = setTimeout(() => {
		isScrolling = false;
		scrollTimeout = null;
	}, duration);
}

/**
 * Scroll to player position (for high-intent navigation)
 */
export function scrollToPlayer(playerRef: React.RefObject<HTMLElement>): void {
	if (playerRef.current) {
		smoothScrollTo(playerRef.current, {
			behavior: 'smooth',
			block: 'start',
		}, 500);
	}
}

/**
 * Scroll to overview section (for navigation context)
 */
export function scrollToOverview(overviewRef: React.RefObject<HTMLElement>): void {
	if (overviewRef.current) {
		smoothScrollTo(overviewRef.current, {
			behavior: 'smooth',
			block: 'start',
		}, 500);
	}
}
