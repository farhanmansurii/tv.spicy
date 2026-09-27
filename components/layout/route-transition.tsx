'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { enterRoute, leaveRoute } from '@/lib/motion';

const MAIN_ID = 'main-content';

function isRouteChangeClick(event: MouseEvent): boolean {
	if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
	const anchor = (event.target as Element | null)?.closest('a');
	if (!anchor || anchor.hasAttribute('download')) return false;
	if (anchor.target && anchor.target !== '_self') return false;
	const url = new URL(anchor.href, window.location.href);
	return url.origin === window.location.origin && url.pathname !== window.location.pathname;
}

/** Page content fades out on an internal link click and back in when the next route commits. */
export function RouteTransition() {
	const pathname = usePathname();

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			const main = document.getElementById(MAIN_ID);
			if (main && isRouteChangeClick(event)) leaveRoute(main);
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	}, []);

	useEffect(() => {
		const main = document.getElementById(MAIN_ID);
		if (main) enterRoute(main);
	}, [pathname]);

	return null;
}
