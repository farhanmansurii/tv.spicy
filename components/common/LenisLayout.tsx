'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import { useState } from 'react';

const LenisLayout = ({ children }: { children: React.ReactNode }) => {
	const lenisOptions = {
		lerp: 0.08,
		duration: 0.9,
		smoothWheel: true,
	};
	return (
		<ReactLenis root options={lenisOptions}>
			{children}
		</ReactLenis>
	);
};

export default LenisLayout;
