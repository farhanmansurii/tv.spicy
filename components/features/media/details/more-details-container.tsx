// @ts-nocheck
'use client';

import { Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Shapes } from 'lucide-react';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';
import SegmentedControl from '@/components/shared/segmented-control';
import { DetailHeader, DetailShell } from './detail-primitives';
import { useHaptics } from '@/hooks/use-haptics';

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
	const haptic = useHaptics();

	return (
		<DetailShell>
			<DetailHeader
				title="More to Watch"
				subtitle={activeLabel}
				action={
					<SegmentedControl
						value={selected}
						onChange={(val) => {
							haptic('selection');
							setSelected(val as TabType);
						}}
						items={TABS.map((tab) => ({
							value: tab.value,
							label: tab.value === 'related' ? 'Similar' : 'For You',
							icon: tab.value === 'related' ? Shapes : Compass,
							showLabelOnMobile: false,
							tooltip: tab.label,
						}))}
					/>
				}
			/>

			<div className="w-full relative mt-2">
				<AnimatePresence mode="wait">
					<motion.div
						key={selected}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
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
		</DetailShell>
	);
}
