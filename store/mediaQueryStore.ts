'use client';
import { create } from 'zustand';

interface MediaQueryStore {
	isMobile: boolean;
	init: () => (() => void) | undefined;
}

export const useMediaQueryStore = create<MediaQueryStore>((set) => ({
	isMobile: false,
	init: () => {
		if (typeof window === 'undefined') return;

		const checkMedia = () => {
			const mobile = window.matchMedia('(max-width: 768px)').matches;
			set({ isMobile: mobile });
		};

		checkMedia();

		const mq = window.matchMedia('(max-width: 768px)');
		mq.addEventListener('change', checkMedia);

		return () => {
			mq.removeEventListener('change', checkMedia);
		};
	},
}));

export function useMediaQuery() {
	return useMediaQueryStore((state) => state.isMobile);
}

