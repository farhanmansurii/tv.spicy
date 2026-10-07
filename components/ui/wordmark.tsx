import { cn } from '@/lib/utils';

interface WordmarkProps {
	size?: 'default' | 'sm';
	className?: string;
}

export function Wordmark({ size = 'default', className }: WordmarkProps) {
	return (
		<span className={cn('inline-flex items-center gap-2', className)}>
			<span
				className={cn(
					'font-sans font-medium tracking-normal text-text',
					size === 'sm' ? 'text-base' : 'text-md'
				)}
			>
				Spicy
			</span>
			<span
				aria-hidden="true"
				className={cn('rounded-full bg-brand', size === 'sm' ? 'size-1' : 'size-1.5')}
			/>
			<span className="font-mono text-micro uppercase tracking-meta text-dim">TV</span>
		</span>
	);
}
