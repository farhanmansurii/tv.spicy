'use client';

import React from 'react';
import { Settings, ChevronRight, X, RotateCcw } from 'lucide-react';
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
			className="inline-flex items-center gap-1.5 h-9 md:h-11 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white transition-[background-color,border-color,color] duration-200 backdrop-blur-sm ring-1 ring-white/[0.06] group/resume"
			title={`Resume from ${formatTimestamp(seconds)}`}
		>
			<RotateCcw className="w-3 h-3 text-zinc-400 group-hover/resume:text-zinc-200 transition-colors duration-200" />
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
		<div className="flex items-center justify-between gap-2">
			{/* Left side: provider selector + resume chip */}
			<div className="flex items-center gap-2">
				<Select value={selectedProvider} onValueChange={onProviderChange}>
					<SelectTrigger className="h-9 md:h-11 w-fit bg-white/[0.06] border-white/10 rounded-full px-4 hover:bg-white/[0.10] transition-[background-color,box-shadow] duration-200 gap-3 shadow-lg backdrop-blur-sm ring-1 ring-white/[0.08]">
						<Settings className="w-3.5 h-3.5 text-zinc-400" />
						<SelectValue className="text-xs md:text-sm font-medium text-zinc-200">
							{currentLabel}
						</SelectValue>
					</SelectTrigger>
					<SelectContent className="bg-zinc-950/95 border-white/10 rounded-xl backdrop-blur-xl p-1.5 shadow-2xl max-h-[300px]">
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
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						onClick={onNextEpisode}
						className="h-9 md:h-11 rounded-full px-4 md:px-6 transition-[background-color,box-shadow] duration-200 gap-2 group/next bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
					>
						<span className="text-xs md:text-sm font-semibold hidden sm:inline">
							Next Episode
						</span>
						<ChevronRight className="w-4 h-4 transition-transform group-hover/next:translate-x-0.5" />
					</Button>

					{isSticky && onCloseSticky && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onCloseSticky}
							className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 backdrop-blur-sm"
							aria-label="Hide sticky player"
							title="Hide sticky player"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
