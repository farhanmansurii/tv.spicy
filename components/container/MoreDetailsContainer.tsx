'use client';
import { Anime, Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import MoreInfoComponent from '../common/MoreInfoComponent';
import GridLoader from '../loading/GridLoader';

const RelatedShowsComponent = dynamic(() => import('../container/RelatedShowContainer'), {
	ssr: false,
	loading: () => <GridLoader />,
});

const tabs = ['Related Shows', 'Recommendations'];

interface TabProps {
	text: string;
	selected: boolean;
	setSelected: (text: string) => void;
}

export default function MoreDetailsContainer(props: {
	show: Show | Anime;
	type: string;
	renderContent: (selected: string) => JSX.Element;
}) {
	const [selected, setSelected] = useState<string>(tabs[0]);
	const content = props.renderContent && selected && props.renderContent(selected);
	return (
		<div className="mx-auto  max-w-7xl space-y-8 px-4 md:space-y-12 md:px-0">
			<div className="mb-4  flex flex-wrap items-center gap-2">
				{tabs.map((tab, index) => (
					<Tab
						text={tab}
						selected={selected === tab}
						setSelected={setSelected}
						key={tab}
					/>
				))}
			</div>
			<div className="w-full min-h-[200px] mx-auto">{content}</div>
		</div>
	);
}

const Tab = ({ text, selected, setSelected }: TabProps) => {
	return (
		<button
			onClick={() => setSelected(text)}
			className={`${
				selected
					? 'text-secondary'
					: 'text-secondary-foreground hover:text-secondary-foreground/40'
			} relative rounded-full px-4 py-2 text-sm font-medium transition-colors`}
		>
			<span className="relative z-10">{text}</span>
			{selected && (
				<motion.span
					layoutId="tab"
					transition={{ type: 'spring', duration: 0.4 }}
					className="absolute inset-0 z-0 rounded bg-primary"
				></motion.span>
			)}
		</button>
	);
};
