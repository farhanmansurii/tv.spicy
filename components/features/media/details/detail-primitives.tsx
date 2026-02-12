'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailShellProps extends React.HTMLAttributes<HTMLElement> {
	as?: 'section' | 'div';
}

export function DetailShell({
	as: Component = 'section',
	className,
	children,
	...props
}: DetailShellProps) {
	return (
		<Component
			className={cn(
				'w-full rounded-[24px] border border-white/10 bg-zinc-950/55 p-4 md:p-6 backdrop-blur-xl shadow-[0_10px_26px_rgba(0,0,0,0.2)]',
				className
			)}
			{...props}
		>
			{children}
		</Component>
	);
}

interface DetailHeaderProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
	className?: string;
}

export function DetailHeader({ title, subtitle, action, className }: DetailHeaderProps) {
	return (
		<div className={cn('mb-3.5 flex items-start justify-between gap-3', className)}>
			<div>
				<p className="text-base md:text-lg font-semibold text-zinc-100">{title}</p>
				{subtitle && <p className="mt-1 text-xs md:text-sm text-zinc-400">{subtitle}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}

interface DetailPillProps {
	label: string;
	icon?: LucideIcon;
	className?: string;
}

export function DetailPill({ label, icon: Icon, className }: DetailPillProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-zinc-200/95',
				className
			)}
		>
			{Icon && <Icon className="h-3.5 w-3.5 text-zinc-300/90" />}
			{label}
		</span>
	);
}
