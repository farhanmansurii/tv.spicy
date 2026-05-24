'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import type { Episode } from '@/lib/types';

export type EpisodeViewMode = 'grid' | 'list';

interface EpisodeStripProps {
	episodes: Episode[];
	activeEpisodeId?: number | string | null;
	onEpisodeClick: (episode: Episode, event?: React.MouseEvent) => void;
	isLoading?: boolean;
	viewMode?: EpisodeViewMode;
}

/* ── Skeletons ─────────────────────────────────────────────────────────────── */

function GridSkeleton() {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: i * 0.05 }}
					className="rounded-2xl overflow-hidden"
					style={{
						background: 'rgba(255,255,255,0.04)',
						border: '1px solid rgba(255,255,255,0.05)',
					}}
				>
					<div className="aspect-video relative overflow-hidden">
						<motion.div
							className="absolute inset-0"
							style={{
								background:
									'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
							}}
							animate={{ x: ['-100%', '100%'] }}
							transition={{
								duration: 1.5,
								ease: 'easeInOut',
								repeat: Infinity,
								delay: i * 0.12,
							}}
						/>
					</div>
					<div className="px-3 pt-2.5 pb-3 space-y-1.5">
						<div className="h-2 w-12 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
						<div className="h-3.5 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
						<div className="h-2.5 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
					</div>
				</motion.div>
			))}
		</div>
	);
}

function ListSkeleton() {
	return (
		<div className="flex flex-col gap-0.5">
			{Array.from({ length: 6 }).map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: i * 0.04 }}
					className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
					style={{ background: 'rgba(255,255,255,0.02)' }}
				>
					<div
						className="flex-shrink-0 w-7 h-4 rounded"
						style={{ background: 'rgba(255,255,255,0.04)' }}
					/>
					<div
						className="flex-shrink-0 w-28 aspect-video rounded-xl relative overflow-hidden"
						style={{ background: 'rgba(255,255,255,0.04)' }}
					>
						<motion.div
							className="absolute inset-0"
							style={{
								background:
									'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
							}}
							animate={{ x: ['-100%', '100%'] }}
							transition={{
								duration: 1.5,
								ease: 'easeInOut',
								repeat: Infinity,
								delay: i * 0.1,
							}}
						/>
					</div>
					<div className="flex-1 space-y-1.5">
						<div className="h-2.5 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
						<div className="h-2 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
					</div>
				</motion.div>
			))}
		</div>
	);
}

/* ── Empty State ───────────────────────────────────────────────────────────── */

function EmptyEpisodes() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: 'spring', stiffness: 200, damping: 24 }}
			className="flex flex-col items-center justify-center py-16 gap-3"
		>
			<div
				className="w-12 h-12 rounded-2xl flex items-center justify-center"
				style={{
					background: 'rgba(255,255,255,0.04)',
					border: '1px solid rgba(255,255,255,0.06)',
				}}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-white/25"
				>
					<path d="M7 4v16M17 4v16M3 8h4M3 16h4M17 8h4M17 16h4" strokeLinecap="round" />
				</svg>
			</div>
			<p className="text-sm font-medium text-white/40">No episodes available</p>
			<p className="text-xs text-white/20">Try selecting a different season</p>
		</motion.div>
	);
}

/* ── Main ──────────────────────────────────────────────────────────────────── */

function EpisodeStripComponent({
	episodes,
	activeEpisodeId,
	onEpisodeClick,
	isLoading,
	viewMode = 'grid',
}: EpisodeStripProps) {
	if (isLoading) {
		return (
			<div className="w-full">
				{viewMode === 'grid' && <GridSkeleton />}
				{viewMode === 'list' && <ListSkeleton />}
			</div>
		);
	}

	if (!episodes.length) {
		return <EmptyEpisodes />;
	}

	return (
		<div className="w-full">
			<AnimatePresence mode="wait">
				{viewMode === 'grid' && (
					<motion.div
						key="grid"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
					>
						{episodes.map((ep, i) => (
							<EpisodeCard
								key={ep.id}
								episode={ep}
								active={activeEpisodeId === ep.id}
								onClick={onEpisodeClick}
								index={i}
							/>
						))}
					</motion.div>
				)}

				{viewMode === 'list' && (
					<motion.div
						key="list"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="flex flex-col gap-0"
					>
						{episodes.map((ep, i) => (
							<EpisodeListRow
								key={ep.id}
								episode={ep}
								active={activeEpisodeId === ep.id}
								onClick={onEpisodeClick}
								index={i}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export const EpisodeStrip = memo(EpisodeStripComponent);
EpisodeStripComponent.displayName = 'EpisodeStrip';
