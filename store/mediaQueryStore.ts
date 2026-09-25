'use client';
import { create } from 'zustand';

// Must stay the exact complement of Tailwind's `md` breakpoint (`md:` applies at
// width >= 768px) so JS and CSS switch at the same pixel. Update both together.
const MOBILE_QUERY = '(max-width: 767.98px)';

interface MediaQueryStore {
	isMobile: boolean;
	init: () => (() => void) | undefined;
}

export const useMediaQueryStore = create<MediaQueryStore>((set) => ({
	isMobile: false,
	init: () => {
		if (typeof window === 'undefined') return;

		const mq = window.matchMedia(MOBILE_QUERY);

		const checkMedia = () => {
			set({ isMobile: mq.matches });
		};

		checkMedia();

		mq.addEventListener('change', checkMedia);

		return () => {
			mq.removeEventListener('change', checkMedia);
		};
	},
}));

export function useMediaQuery() {
	return useMediaQueryStore((state) => state.isMobile);
}

