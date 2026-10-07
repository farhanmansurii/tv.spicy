'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import {
	CaretLeftIcon,
	CaretRightIcon,
	XIcon,
	ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { hidePlayerChrome, showPlayerChrome } from '@/lib/motion';
import type { ProviderSummary } from './providers';

const chromeButton =
	'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2.5 text-ui font-medium text-soft transition-[color,background-color,transform] duration-(--duration-ui) ease-out can-hover:bg-raised can-hover:text-text active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40';

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
			type="button"
			onClick={onResume}
			className={cn(chromeButton, 'font-mono text-caption tracking-meta')}
			title={`Resume from ${formatTimestamp(seconds)}`}
		>
			<ArrowCounterClockwiseIcon size={13} aria-hidden="true" />
			<span className="hidden sm:inline">Resume</span>
			<span className="tracking-meta text-muted-foreground">{formatTimestamp(seconds)}</span>
		</button>
	);
}

// ── EpisodePill ───────────────────────────────────────────────────────────────

function EpisodePill({
	label,
	onClick,
	disabled,
	children,
}: {
	label: string;
	onClick?: (() => void) | undefined;
	disabled?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			title={label}
			className={cn(chromeButton, 'min-w-10 px-2.5 text-text md:px-3')}
		>
			{children}
		</button>
	);
}

// ── PlayerControls ────────────────────────────────────────────────────────────

interface PlayerControlsProps {
	providers: ProviderSummary[];
	selectedProvider: string;
	onProviderChange: (id: string) => void;
	/** Seconds of saved progress. Shows a resume chip when > 30. */
	savedPositionSeconds: number;
	/** Called when the user clicks the resume chip. */
	onResume: () => void;
	/** True once the user has already resumed, so the chip is hidden. */
	hasResumed: boolean;
	/** Only rendered for TV shows */
	onNextEpisode?: (() => void) | undefined;
	onPreviousEpisode?: (() => void) | undefined;
	/** False on the first episode of a season, where there is nothing to go back to. */
	canGoPrevious?: boolean;
	mediaType: string;
	isSticky?: boolean;
	onCloseSticky?: (() => void) | undefined;
}

export function PlayerControls({
	providers,
	selectedProvider,
	onProviderChange,
	savedPositionSeconds,
	onResume,
	hasResumed,
	onNextEpisode,
	onPreviousEpisode,
	canGoPrevious = false,
	mediaType,
	isSticky,
	onCloseSticky,
}: PlayerControlsProps) {
	const showResumeChip = !hasResumed && savedPositionSeconds > 30;
	const isSeries = mediaType === 'tv';
	const showNavigation = isSeries && (onNextEpisode || onPreviousEpisode);
	const chromeRef = useRef<HTMLDivElement>(null);

	useGSAP(() => {
		if (chromeRef.current) showPlayerChrome(chromeRef.current);
	}, []);

	const requestClose = () => {
		if (!onCloseSticky) return;
		const frame = chromeRef.current?.closest('[data-player-container]');
		const target = frame instanceof HTMLElement ? frame : chromeRef.current;
		if (!target) {
			onCloseSticky();
			return;
		}
		hidePlayerChrome(target, onCloseSticky);
	};

	return (
		<div
			ref={chromeRef}
			data-player-chrome
			className="flex flex-wrap items-center justify-between gap-1 rounded-md border border-line bg-surface px-1.5 py-1.5"
		>
			{/* Left side: resume and episode navigation */}
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				{showResumeChip && (
					<ResumeChip seconds={savedPositionSeconds} onResume={onResume} />
				)}

				{showNavigation && (
					<>
						<EpisodePill
							label="Previous episode"
							onClick={onPreviousEpisode}
							disabled={!canGoPrevious}
						>
							<CaretLeftIcon size={18} aria-hidden="true" />
							<span className="hidden md:inline">Previous</span>
						</EpisodePill>
						<EpisodePill label="Next episode" onClick={onNextEpisode}>
							<span className="hidden md:inline">Next</span>
							<CaretRightIcon size={18} aria-hidden="true" />
						</EpisodePill>
					</>
				)}
			</div>

			{/* Right side: the server menu and the sticky close */}
			<div className="flex shrink-0 items-center gap-2">
				<Select value={selectedProvider} onValueChange={onProviderChange}>
					<SelectTrigger surface="field" aria-label="Streaming server">
						<span
							aria-hidden="true"
							className="font-mono text-caption uppercase tracking-label text-muted-foreground"
						>
							Server
						</span>
						<SelectValue />
					</SelectTrigger>
					<SelectContent surface="glass" align="end">
						{providers.map((provider) => (
							<SelectItem key={provider.id} value={provider.id} surface="glass">
								{provider.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{isSticky && onCloseSticky && (
					<button
						type="button"
						onClick={requestClose}
						aria-label="Hide sticky player"
						title="Hide sticky player"
						className={cn(chromeButton, 'size-10 px-0 text-dim')}
					>
						<XIcon size={16} aria-hidden="true" />
					</button>
				)}
			</div>
		</div>
	);
}
