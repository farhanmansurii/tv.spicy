'use client';

import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';

export interface EditorialRailItem {
	id: number;
	title: string;
	poster: string | null;
}

interface EditorialHeroRailProps {
	items: EditorialRailItem[];
	current: number;
	isPaused: boolean;
	isHeld: boolean;
	onSelect: (index: number, instant: boolean) => void;
	onAdvance: () => void;
	onTogglePause: () => void;
	onHoldChange: (isHeld: boolean) => void;
}

export const padIndex = (value: number) => String(value).padStart(2, '0');

export function EditorialHeroRail({
	items,
	current,
	isPaused,
	isHeld,
	onSelect,
	onAdvance,
	onTogglePause,
	onHoldChange,
}: EditorialHeroRailProps) {
	return (
		<div
			className="mt-9 flex items-center gap-3 border-t border-line pt-3.5 lg:max-w-260"
			onPointerEnter={(event) => event.pointerType === 'mouse' && onHoldChange(true)}
			onPointerLeave={() => onHoldChange(false)}
		>
			<ul className="flex flex-1 gap-2 overflow-x-auto pt-4 md:grid md:grid-flow-col md:auto-cols-fr md:gap-5 md:overflow-visible md:pt-0">
				{items.map((item, index) => {
					const isCurrent = index === current;
					return (
						<li key={item.id} className="w-36 shrink-0 md:w-auto">
							<button
								type="button"
								onClick={(event) => onSelect(index, event.detail === 0)}
								aria-current={isCurrent}
								aria-label={`Feature ${index + 1} of ${items.length}: ${item.title}`}
								className={cn(
									'relative flex min-h-11 w-full items-center gap-3 rounded-sm py-1.5 text-left text-white/60',
									'transition-[color,transform,scale] duration-(--duration-ui) ease-out active:scale-97 active:duration-(--duration-press)',
									'can-hover:text-foreground motion-reduce:active:scale-100',
									'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none',
									isCurrent && 'text-foreground'
								)}
							>
								<span
									aria-hidden="true"
									className={cn(
										'absolute inset-x-0 -top-3.75 h-0.5 overflow-hidden bg-line',
										index > 0 && '-left-1 md:-left-2.5',
										index < items.length - 1 && '-right-1 md:-right-2.5'
									)}
								>
									<span
										key={isCurrent ? `fill-${current}` : 'idle'}
										onAnimationEnd={(event) => {
											if (
												isCurrent &&
												event.animationName === 'rail-progress'
											) {
												onAdvance();
											}
										}}
										className={cn(
											'block h-full origin-left scale-x-0 bg-brand opacity-0 transition-opacity duration-(--duration-ui) ease-out',
											isCurrent &&
												'animate-rail-progress opacity-100 motion-reduce:animate-none motion-reduce:scale-x-100',
											isCurrent &&
												(isPaused || isHeld) &&
												'animation-paused',
											isCurrent && isPaused && 'opacity-45'
										)}
									/>
								</span>
								<span
									aria-hidden="true"
									className={cn(
										'relative block aspect-2/3 w-9 flex-none overflow-hidden rounded-sm bg-card opacity-50 transition-opacity duration-(--duration-ui) ease-out',
										isCurrent && 'opacity-100'
									)}
								>
									{item.poster && (
										<img
											src={tmdbImage(item.poster, 'w92')}
											alt=""
											loading="lazy"
											decoding="async"
											className="size-full object-cover"
										/>
									)}
								</span>
								<span aria-hidden="true" className="grid min-w-0 gap-1">
									<span className="font-mono text-caption leading-none">
										{padIndex(index + 1)}
									</span>
									<span className="block truncate text-title font-semibold">
										{item.title}
									</span>
								</span>
							</button>
						</li>
					);
				})}
			</ul>
			<button
				type="button"
				onClick={onTogglePause}
				aria-pressed={isPaused}
				aria-label={isPaused ? 'Resume featured rotation' : 'Pause featured rotation'}
				className={cn(
					'hit-target grid size-10 flex-none place-items-center rounded-full border border-line-strong bg-background/40 text-foreground motion-reduce:hidden',
					'transition-[background-color,border-color,transform,scale] duration-(--duration-ui) ease-out active:scale-97 active:duration-(--duration-press)',
					'can-hover:border-foreground/50 can-hover:bg-foreground/[0.14]',
					'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none'
				)}
			>
				{isPaused ? (
					<PlayIcon size={16} weight="fill" aria-hidden="true" />
				) : (
					<PauseIcon size={16} weight="fill" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
