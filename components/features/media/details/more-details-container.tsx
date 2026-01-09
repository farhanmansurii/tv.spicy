'use client';

import { Anime, Show } from '@/lib/types';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';
import { cn } from '@/lib/utils';
import CommonTitle from '@/components/shared/animated/common-title';

const RelatedShowsContainer = dynamic(() => import('./related-shows-container'), {
    ssr: false,
    loading: () => <MoreDetailsLoader />,
});

const TABS = ['RELATED', 'RECOMMENDATIONS'] as const;
type TabType = (typeof TABS)[number];

export default function MoreDetailsContainer({ show, type }: { show: Show | Anime; type: string }) {
    const [selected, setSelected] = useState<TabType>(TABS[0]);

    return (
        <div className="w-full">
            <div className="space-y-2 sm:space-y-3">
                <CommonTitle text="Discovery" variant="section" spacing="none" />
                <CommonTitle
                    text="More Like This"
                    variant="small"
                    spacing="large"
                >
                    <div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.08] rounded-full backdrop-blur-3xl shadow-2xl">
                        {TABS.map((tab) => (
                            <Tab
                                key={tab}
                                text={tab}
                                selected={selected === tab}
                                setSelected={(val) => setSelected(val as TabType)}
                            />
                        ))}
                    </div>
                </CommonTitle>
            </div>

            <div className="w-full  relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selected}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        <RelatedShowsContainer
                            relation={selected === 'RECOMMENDATIONS' ? 'recommendations' : 'similar'}
                            type={type}
                            show={show}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

const Tab = ({ text, selected, setSelected }: { text: string; selected: boolean; setSelected: (t: string) => void }) => {
    return (
        <button
            onClick={() => setSelected(text)}
            className={cn(
                'relative px-5 md:px-7 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 outline-none z-10',
                selected ? 'text-black' : 'text-zinc-500 hover:text-white'
            )}
        >
            <span className="relative z-10">{text}</span>

            {selected && (
                <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 z-0 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                    transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                    }}
                />
            )}
        </button>
    );
};
