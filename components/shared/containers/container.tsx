import { cn } from '@/lib/utils';

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
	variant?: 'default' | 'detail';
}

export default function Container({ children, className, variant = 'default' }: ContainerProps) {
	return (
		<div
			className={cn(
				'w-full mx-auto px-4 sm:px-6 lg:px-8',
				variant === 'detail'
					? 'max-w-7xl 2xl:max-w-[1600px]'
					: 'max-w-7xl 2xl:max-w-screen-2xl',
				className
			)}
		>
			{children}
		</div>
	);
}
