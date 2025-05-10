import { cn } from '@/lib/utils';

export default function CommonTitle({
	text,
	shouldWrap,
	avoidLowerCase = true,
	className,
}: {
	text: string;
	shouldWrap?: boolean;
	avoidLowerCase?: boolean;
	className?: string;
}) {
	return (
		<h1
			className={cn(
				'text-5xl  md:text-6xl  tracking-tight text-foreground',
				shouldWrap ? 'whitespace-pre-wrap ' : '',
				avoidLowerCase ? 'normal-case' : 'lowercase',
				className
			)}
		>
			{text}
		</h1>
	);
}
