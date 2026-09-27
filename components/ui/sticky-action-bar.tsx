'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StickyActionBarProps {
	targetRef?: React.RefObject<HTMLElement | null>;
	targetId?: string;
	className?: string;
	children: React.ReactNode;
}

export function StickyActionBar({
	targetRef,
	targetId,
	className,
	children,
}: StickyActionBarProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let targetElement: HTMLElement | null = null;
		if (targetRef?.current) {
			targetElement = targetRef.current;
		} else if (targetId) {
			targetElement = document.getElementById(targetId);
		}

		if (!targetElement) return;

		const checkVisibility = () => {
			if (!targetElement) return;
			const rect = targetElement.getBoundingClientRect();
			setIsVisible(rect.bottom < 0);
		};

		const observer = new IntersectionObserver(
			() => {
				checkVisibility();
			},
			{ threshold: 0 }
		);

		observer.observe(targetElement);
		window.addEventListener('resize', checkVisibility);
		window.addEventListener('scroll', checkVisibility, { passive: true });
		checkVisibility();

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', checkVisibility);
			window.removeEventListener('scroll', checkVisibility);
		};
	}, [targetRef, targetId]);

	return (
		<aside
			aria-label="Sticky actions"
			aria-hidden={!isVisible}
			className={cn(
				'fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-2 px-gutter py-3 pb-safe md:hidden',
				'border-t border-line-strong bg-canvas',
				'transition-[transform,opacity,visibility]',
				isVisible
					? 'translate-y-0 opacity-100 pointer-events-auto duration-(--duration-fade) ease-entrance'
					: 'translate-y-full opacity-0 pointer-events-none duration-(--duration-press) ease-out invisible',
				'motion-reduce:translate-y-0 motion-reduce:duration-(--duration-fade)',
				className
			)}
		>
			{children}
		</aside>
	);
}
