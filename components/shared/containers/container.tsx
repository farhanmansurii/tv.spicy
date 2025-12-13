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
				'w-full mx-auto',
				variant === 'detail'
					? 'max-w-7xl 2xl:max-w-[1600px] px-4 md:px-6 lg:px-8 xl:px-12'
					: 'max-w-screen-xl 2xl:max-w-screen-2xl px-4 md:px-8 lg:px-12',
				className
			)}
		>
			{children}
		</div>
	);
}
