import { cn } from '@/lib/utils';

interface CommonTitleProps {
	text: string;
	variant?: 'default' | 'large' | 'xl' | 'hero' | 'section' | 'small';
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	shouldWrap?: boolean;
	avoidLowerCase?: boolean;
	className?: string;
}

const variantStyles = {
	default: 'text-3xl md:text-4xl font-semibold tracking-tight',
	large: 'text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter',
	xl: 'text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter',
	hero: 'text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none',
	section: 'text-lg md:text-xl font-semibold tracking-tight',
	small: 'text-xl md:text-2xl font-extrabold tracking-tight',
};

export default function CommonTitle({
	text,
	variant = 'default',
	as: Component = 'h1',
	shouldWrap = false,
	avoidLowerCase = true,
	className,
}: CommonTitleProps) {
	return (
		<Component
			className={cn(
				variantStyles[variant],
				'text-foreground',
				shouldWrap && 'whitespace-pre-wrap',
				avoidLowerCase ? 'normal-case' : 'lowercase',
				className
			)}
		>
			{text}
		</Component>
	);
}
