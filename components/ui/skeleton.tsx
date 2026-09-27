import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="skeleton"
			className={cn('animate-pulse motion-reduce:animate-none rounded-md bg-primary/10', className)}
			{...props}
		/>
	);
}

export { Skeleton };
