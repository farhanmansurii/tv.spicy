interface BrowseCollectionHeaderProps {
	title: string;
	description: string;
	count?: number;
}

export function BrowseCollectionHeader({ title, description, count }: BrowseCollectionHeaderProps) {
	return (
		<div className="max-w-3xl">
			<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
				{title}
			</h1>
			<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-relaxed text-white/48 md:text-title">
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
