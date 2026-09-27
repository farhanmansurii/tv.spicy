import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, surface = 'default', ...props }: React.ComponentProps<'input'> & { surface?: 'default' | 'sidebar' }) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'flex h-9 w-full min-w-0 rounded-sm border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm',
				surface === 'sidebar' && 'bg-background',
				className
			)}
			{...props}
		/>
	);
}

export { Input };
