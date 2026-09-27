import { cn } from '@/lib/utils';

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
}

export default function Container({ children, className }: ContainerProps) {
	return <div className={cn('w-full px-gutter', className)}>{children}</div>;
}
