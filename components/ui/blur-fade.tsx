'use client';

import { useRef } from 'react';
import { motion, useInView, UseInViewOptions, Variants } from 'framer-motion';

type MarginType = UseInViewOptions['margin'];

interface BlurFadeProps {
	children: React.ReactNode;
	className?: string;
	variant?: {
		hidden: { y: number; opacity?: number; filter?: string };
		visible: { y: number; opacity?: number; filter?: string };
	};
	duration?: number;
	delay?: number;
	yOffset?: number;
	inView?: boolean;
	inViewMargin?: MarginType;
	blur?: string;
}

export default function BlurFade({
	children,
	className,
	variant,
	duration = 0.4,
	delay = 0,
	yOffset = 6,
	inView = false,
	inViewMargin = '-50px',
	blur = '0px',
}: BlurFadeProps) {
	const ref = useRef(null);
	const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
	const isInView = !inView || inViewResult;

	const defaultVariants: Variants = {
		hidden: {
			opacity: 0,
			y: yOffset,
		},
		visible: {
			opacity: 1,
			y: 0,
		},
	};

	const combinedVariants = variant || defaultVariants;

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			variants={combinedVariants}
			transition={{
				delay: delay,
				duration,
				ease: [0.25, 0.4, 0.25, 1],
			}}
			style={{
				willChange: 'opacity, transform',
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
