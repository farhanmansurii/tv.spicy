import { cn } from '@/lib/utils';

export default function CommonContainer({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn('mx-auto  max-w-7xl space-y-4 px-2 lg:px-0', className)}>{children}</div>
	);
}
