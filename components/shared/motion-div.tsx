'use client';

import React, { ReactNode } from 'react';
import { motion, useReducedMotion, type Transition, type Target } from 'framer-motion';

interface MotionDivProps {
	children: ReactNode;
	className?: string;
	initial?: Target;
	animate?: Target;
	transition?: Transition;
}

export function MotionDiv({
	children,
	className,
	initial,
	animate,
	transition,
}: MotionDivProps) {
	const prefersReduced = useReducedMotion();
	// Force animations on for visual testing (set to prefersReduced for production)
	const shouldReduceMotion = false;

	return (
		<motion.div
			className={className}
			initial={shouldReduceMotion ? undefined : initial}
			animate={animate}
			transition={shouldReduceMotion ? { duration: 0 } : transition}
		>
			{children}
		</motion.div>
	);
}
