import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CommonTitle from '@/components/shared/animated/common-title';
import GridLoader from './grid-loader';

export default function MoreDetailsLoader() {
	return (
		<div className="w-full">
			<div className="space-y-2 sm:space-y-3">
				<CommonTitle text="Discovery" variant="section" spacing="none" />
				<CommonTitle text="More Like This" variant="small" spacing="large">
					<div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.08] rounded-full backdrop-blur-3xl shadow-2xl">
						<button className="relative px-5 md:px-7 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 outline-none z-10 text-black">
							<span className="relative z-10">RELATED</span>
							<span className="absolute inset-0 z-0 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)]" />
						</button>
						<button className="relative px-5 md:px-7 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 outline-none z-10 text-zinc-500">
							<span className="relative z-10">RECOMMENDATIONS</span>
						</button>
					</div>
				</CommonTitle>
			</div>

			<div className="w-full min-h-[400px]">
				<GridLoader isVertical={true} />
			</div>
		</div>
	);
}
