'use client';

import React from 'react';
import { GearIcon, CaretRightIcon, XIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ProviderConfig } from './providers';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format raw seconds into H:MM:SS or M:SS */
function formatTimestamp(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${m}:${String(s).padStart(2, '0')}`;
}

// ── ResumeChip ────────────────────────────────────────────────────────────────

interface ResumeChipProps {
	seconds: number;
	onResume: () => void;
}

function ResumeChip({ seconds, onResume }: ResumeChipProps) {
	return (
		<button
			onClick={onResume}
			className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 text-[11px] font-medium text-zinc-200 ring-1 ring-white/[0.04] transition-[background-color,border-color,color,transform] duration-200 hover:border-white/20 hover:bg-white/[0.12] hover:text-white active:scale-[0.98] md:h-10 md:px-3.5 md:text-sm group/resume"
			title={`Resume from ${formatTimestamp(seconds)}`}
		>
			<ArrowCounterClockwiseIcon size={12} className="text-zinc-400 group-hover/resume:text-zinc-200 transition-colors duration-200" />
			<span className="hidden sm:inline">Resume</span>
			<span className="font-mono tracking-tight text-zinc-300 group-hover/resume:text-white transition-colors duration-200">
				{formatTimestamp(seconds)}
			</span>
		</button>
	);
}

// ── PlayerControls ────────────────────────────────────────────────────────────

interface PlayerControlsProps {
	providers: ProviderConfig[];
	selectedProvider: string;
	currentLabel: string;
	onProviderChange: (name: string) => void;
	/** Seconds of saved progress. Shows a resume chip when > 30. */
	savedPositionSeconds: number;
	/** Called when the user clicks the resume chip. */
	onResume: () => void;
	/** True once the user has already resumed, so the chip is hidden. */
	hasResumed: boolean;
	/** Only rendered for TV shows */
	onNextEpisode?: (() => void) | undefined;
	mediaType: string;
	isSticky?: boolean;
	onCloseSticky?: (() => void) | undefined;
}

export function PlayerControls({
	providers,
	selectedProvider,
	currentLabel,
	onProviderChange,
	savedPositionSeconds,
	onResume,
	hasResumed,
	onNextEpisode,
	mediaType,
	isSticky,
	onCloseSticky,
}: PlayerControlsProps) {
	const showResumeChip = !hasResumed && savedPositionSeconds > 30;

	return (
		<div className="flex flex-wrap items-center justify-between gap-1.5 px-1 pb-1">
			{/* Left side: provider selector + resume chip */}
			<div className="flex min-w-0 flex-1 items-center gap-1.5">
				<Select value={selectedProvider} onValueChange={onProviderChange}>
					<SelectTrigger className="h-8 w-fit min-w-0 max-w-[52vw] rounded-full border-white/10 bg-white/[0.06] px-3 text-xs ring-1 ring-white/[0.04] transition-[background-color,border-color,transform] duration-200 hover:border-white/18 hover:bg-white/[0.1] active:scale-[0.98] md:h-10 md:max-w-none md:px-4">
						<GearIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
						<SelectValue className="truncate text-xs font-medium text-zinc-200 md:text-sm">
							{currentLabel}
						</SelectValue>
					</SelectTrigger>
					<SelectContent className="max-h-[300px] rounded-xl border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
						{providers.map((provider) => (
							<SelectItem
								key={provider.name}
								value={provider.name}
								className="text-xs rounded-lg"
							>
								{provider.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{showResumeChip && (
					<ResumeChip seconds={savedPositionSeconds} onResume={onResume} />
				)}
			</div>

			{/* Right side: next episode + close sticky — TV only */}
			{onNextEpisode && mediaType === 'tv' && (
				<div className="flex shrink-0 items-center gap-1.5">
					<Button
						variant="ghost"
						onClick={onNextEpisode}
						className="h-8 rounded-full bg-white px-3 text-black transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.98] md:h-10 md:px-5 gap-1.5 group/next font-semibold"
					>
						<span className="hidden text-xs font-semibold sm:inline md:text-sm">
							Next
						</span>
						<CaretRightIcon className="h-4 w-4 transition-transform group-hover/next:translate-x-0.5" />
					</Button>

					{isSticky && onCloseSticky && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onCloseSticky}
							className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.06] text-zinc-200 backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white/[0.12] active:scale-[0.98] md:h-10 md:w-10"
							aria-label="Hide sticky player"
							title="Hide sticky player"
						>
							<XIcon className="w-4 h-4" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
