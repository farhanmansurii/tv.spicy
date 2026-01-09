'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
	direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export default function FadeIn({
	children,
	className,
	delay = 0,
	duration = 500,
	direction = 'up',
	...props
}: FadeInProps) {
	const directionStyles = {
		up: 'translateY(8px)',
		down: 'translateY(-8px)',
		left: 'translateX(8px)',
		right: 'translateX(-8px)',
		none: 'translateY(0)',
	};

	return (
		<div
			className={cn('opacity-0 transition-all ease-out', className)}
			style={{
				willChange: 'opacity, transform',
				animation: `fadeInOptimized ${duration}ms ease-out ${delay}ms forwards`,
				'--initial-transform': directionStyles[direction],
			} as any}
			{...props}
		>
			{children}
		</div>
	);
}
