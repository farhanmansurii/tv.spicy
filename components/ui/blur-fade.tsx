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
	yOffset = 0,
	inView = false,
	inViewMargin = '-50px',
	blur = '6px',
}: BlurFadeProps) {
	const ref = useRef(null);
	const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
	const isInView = !inView || inViewResult;

	const defaultVariants: Variants = {
		hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
		visible: { y: -yOffset, opacity: 1, filter: 'blur(0px)' },
	};

	const combinedVariants = variant || defaultVariants;

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			variants={combinedVariants}
			transition={{
				delay: 0.04 + delay,
				duration,
				ease: 'easeOut',
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
