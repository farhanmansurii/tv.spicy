import { cn } from '@/lib/utils';

interface WordmarkProps {
	size?: 'default' | 'sm';
	className?: string;
}

export function Wordmark({ size = 'default', className }: WordmarkProps) {
	return (
		<span className={cn('inline-flex items-center gap-1.5', className)}>
			<span
				className={cn(
					'font-display uppercase tracking-normal text-foreground',
					size === 'sm' ? 'text-xl' : 'text-2xl'
				)}
			>
				SPICY
			</span>
			<span
				aria-hidden="true"
				className={cn('rounded-full bg-brand', size === 'sm' ? 'size-1.5' : 'size-2')}
			/>
			<span className="font-mono text-micro uppercase tracking-meta text-muted-foreground">TV</span>
		</span>
	);
}
