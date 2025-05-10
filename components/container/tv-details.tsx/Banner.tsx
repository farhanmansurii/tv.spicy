import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

type BannerProps = {
	url?: string;
} & ComponentProps<'div'>;

export const Banner = ({ url, className, ...props }: BannerProps) => {
	return (
		<div
			{...props}
			className={cn(
				'w-full h-[28vh] lg:h-[38vh] xl:h-[42vh] bg-black overflow-hidden',
				className
			)}
		>
			<div
				style={{
					backgroundImage: `url('${url}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
				className="w-full h-full brightness-50"
				data-testid="banner"
			/>
		</div>
	);
};
