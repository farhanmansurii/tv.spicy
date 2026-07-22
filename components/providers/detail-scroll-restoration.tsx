'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const TOP_LEVEL_MEDIA_ROUTES = ['/movie/', '/tv/', '/browse/'];

export function DetailScrollRestoration() {
	const pathname = usePathname();

	useLayoutEffect(() => {
		if (!TOP_LEVEL_MEDIA_ROUTES.some((prefix) => pathname.startsWith(prefix))) return;

		const previousRestoration = window.history.scrollRestoration;
		window.history.scrollRestoration = 'manual';
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;

		return () => {
			window.history.scrollRestoration = previousRestoration;
		};
	}, [pathname]);

	return null;
}
