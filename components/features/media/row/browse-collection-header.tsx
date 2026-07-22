interface BrowseCollectionHeaderProps {
	title: string;
	description: string;
	count?: number;
}

export function BrowseCollectionHeader({ title, description, count }: BrowseCollectionHeaderProps) {
	return (
		<div className="max-w-3xl">
			<h1 className="text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
				{title}
			</h1>
			<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-relaxed text-white/48 md:text-[15px]">
				<p>{description}</p>
				{typeof count === 'number' && (
					<span className="whitespace-nowrap text-white/30 tabular-nums">
						{count} {count === 1 ? 'title' : 'titles'}
					</span>
				)}
			</div>
		</div>
	);
}
