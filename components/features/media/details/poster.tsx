import { LucideImage } from 'lucide-react';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type PosterProps = {
	url?: string;
	alt: string;
} & ComponentProps<'div'>;

export const Poster = ({ url, alt, className, ...props }: PosterProps) => {
	return (
		<div
			className={cn(
				'relative aspect-[2/3] bg-background w-full flex items-center justify-center overflow-hidden',
				className
			)}
			{...props}
		>
			{url ? (
				<img alt={alt} src={url} className="object-contain w-full h-full" />
			) : (
				<LucideImage className="text-white/30" size={24} />
			)}
		</div>
	);
};
