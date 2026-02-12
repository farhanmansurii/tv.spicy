import React from 'react';
import CommonTitle from '@/components/shared/animated/common-title';
import { MediaLoader } from '@/components/shared/loaders/media-loader';

export default function MoreDetailsLoader() {
	return (
		<div className="w-full">
			<div className="space-y-2 sm:space-y-3">
				<CommonTitle text="Discovery" variant="section" spacing="none" />
				<CommonTitle text="More Like This" variant="small" spacing="large">
					<div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.08] rounded-full backdrop-blur-3xl shadow-2xl">
						<button className="relative px-5 md:px-7 py-2.5 text-xs font-medium transition-all duration-300 outline-none z-10 rounded-full text-black shadow-lg">
							<span className="relative z-10">Related</span>
							<span className="absolute inset-0 z-0 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)]" />
						</button>
						<button className="relative px-5 md:px-7 py-2.5 text-xs font-medium transition-all duration-300 outline-none z-10 rounded-full text-zinc-400 hover:text-white">
							<span className="relative z-10">Recommendations</span>
						</button>
					</div>
				</CommonTitle>
			</div>

			<div className="w-full relative mt-6 md:mt-8">
				<MediaLoader layout="grid" isVertical />
			</div>
		</div>
	);
}
