'use client';

import { Anime, Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';
import { cn } from '@/lib/utils';
import CommonTitle from '@/components/shared/animated/common-title';

const RelatedShowsContainer = dynamic(() => import('./related-shows-container'), {
	ssr: false,
	loading: () => <MoreDetailsLoader />,
});

const tabs = ['Related Shows', 'Recommendations'];

interface TabProps {
	text: string;
	selected: boolean;
	setSelected: (text: string) => void;
}

export default function MoreDetailsContainer({ show, type }: { show: Show | Anime; type: string }) {
	const [selected, setSelected] = useState<string>(tabs[0]);

	const renderContent = () => {
		switch (selected) {
			case 'Recommendations':
				return <RelatedShowsContainer relation="recommendations" type={type} show={show} />;
			case 'Related Shows':
				return <RelatedShowsContainer relation="similar" type={type} show={show} />;
			default:
				return <div className="text-white/40 text-center py-10">No Content Available</div>;
		}
	};

	return (
		<div className="w-full  animate-in fade-in slide-in-from-bottom-8 duration-700">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<CommonTitle text="More Like This" />
				<div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shadow-lg ring-1 ring-white/5">
					{tabs.map((tab) => (
						<Tab
							text={tab}
							selected={selected === tab}
							setSelected={setSelected}
							key={tab}
						/>
					))}
				</div>
			</div>

			<div className="w-full min-h-[400px]">{renderContent()}</div>
		</div>
	);
}

const Tab = ({ text, selected, setSelected }: TabProps) => {
	return (
		<button
			onClick={() => setSelected(text)}
			className={cn(
				'relative px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50',
				selected ? 'text-black' : 'text-white/60 hover:text-white'
			)}
		>
			<span className="relative z-10">{text}</span>

			{selected && (
				<motion.span
					layoutId="active-pill"
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 0,
						backgroundColor: 'white',
						borderRadius: '9999px',
						boxShadow: '0 0 20px rgba(255,255,255,0.3)',
					}}
					transition={{
						type: 'spring',
						stiffness: 300,
						damping: 30,
					}}
				/>
			)}
		</button>
	);
};
