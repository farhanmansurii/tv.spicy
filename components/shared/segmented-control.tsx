'use client';

import React, { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { GlowingButton } from '@/components/ui/glowing-button';

export interface SegmentedControlItem {
	value: string;
	label: string;
	icon?: LucideIcon;
	count?: number;
	showLabelOnMobile?: boolean;
	tooltip?: string;
}

interface SegmentedControlProps {
	value: string;
	onChange: (value: string) => void;
	items: SegmentedControlItem[];
	className?: string;
}

export default function SegmentedControl({
	value,
	onChange,
	items,
	className,
}: SegmentedControlProps) {
	const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	useEffect(() => {
		const activeEl = itemRefs.current[value];
		if (!activeEl) return;

		gsap.fromTo(
			activeEl,
			{ scale: 0.98, opacity: 0.9 },
			{ scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out' }
		);
	}, [value]);

	return (
		<div
			className={cn(
				'inline-flex flex-none max-w-max items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-2xl',
				className
			)}
		>
			{items.map((item) => {
				const isActive = item.value === value;
				return (
					<GlowingButton
						key={item.value}
						ref={(node) => {
							itemRefs.current[item.value] = node;
						}}
						variant="ghost"
						size="sm"
						glow={isActive}
						glowVariant="light"
						onClick={() => onChange(item.value)}
						title={item.tooltip}
						aria-pressed={isActive}
						aria-label={item.label}
						className={cn(
							'rounded-full px-3 py-1.5 text-xs font-medium',
							'focus-visible:ring-white/50 focus-visible:ring-offset-black',
							isActive
								? 'bg-white text-black hover:bg-white hover:text-black'
								: 'text-zinc-400 hover:text-white hover:bg-white/5'
						)}
					>
						{item.icon && <item.icon className="h-3.5 w-3.5" />}
						<span
							className={cn(item.showLabelOnMobile === false && 'hidden sm:inline')}
						>
							{item.label}
						</span>
						{typeof item.count === 'number' && (
							<span className="text-[9px] font-bold text-current/60">
								{item.count}
							</span>
						)}
					</GlowingButton>
				);
			})}
		</div>
	);
}
