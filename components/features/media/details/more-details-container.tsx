// @ts-nocheck
'use client';

import { Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, Star } from 'lucide-react';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';
import SegmentedControl from '@/components/shared/segmented-control';

const RelatedShowsContainer = dynamic(() => import('./related-shows-container'), {
	ssr: false,
	loading: () => <MoreDetailsLoader />,
});

const TABS = [
	{ value: 'related', label: 'Related' },
	{ value: 'recommendations', label: 'Recommendations' },
] as const;

type TabType = (typeof TABS)[number]['value'];

export default function MoreDetailsContainer({ show, type }: { show: Show; type: string }) {
	const [selected, setSelected] = useState<TabType>('related');
	const activeLabel = selected === 'related' ? 'Similar' : 'For You';

	return (
		<section className="w-full rounded-[28px] border border-white/10 bg-zinc-950/55 p-5 md:p-7 backdrop-blur-xl">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div>
					<h2 className="text-sm font-semibold text-zinc-200">
						More to Watch
					</h2>
					<p className="mt-1 text-xs text-zinc-400">{activeLabel}</p>
				</div>
				<SegmentedControl
					value={selected}
					onChange={(val) => setSelected(val as TabType)}
					items={TABS.map((tab) => ({
						value: tab.value,
						label: tab.value === 'related' ? 'Similar' : 'For You',
						icon: tab.value === 'related' ? Shapes : Star,
						showLabelOnMobile: false,
						tooltip: tab.label,
					}))}
				/>
			</div>

			<div className="w-full relative mt-2">
				<AnimatePresence mode="wait">
					<motion.div
						key={selected}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
					>
						<React.Suspense fallback={<MoreDetailsLoader />}>
							<RelatedShowsContainer
								relation={
									selected === 'recommendations' ? 'recommendations' : 'similar'
								}
								type={type}
								show={show}
							/>
						</React.Suspense>
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
}
