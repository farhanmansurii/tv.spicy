'use client';

import { Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';
import CommonTitle from '@/components/shared/animated/common-title';
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

	return (
		<div className="w-full">
			<div className="space-y-2 sm:space-y-3">
				<CommonTitle text="Discovery" variant="section" spacing="none" />
				<CommonTitle text="More Like This" variant="small" spacing="large">
					<SegmentedControl
						value={selected}
						onChange={(val) => setSelected(val as TabType)}
						items={TABS.map((tab) => ({
							value: tab.value,
							label: tab.label,
						}))}
					/>
				</CommonTitle>
			</div>

			<div className="w-full relative mt-6 md:mt-8">
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
		</div>
	);
}
