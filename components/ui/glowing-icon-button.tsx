import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonProps } from '@/components/ui/button';

type GlowVariant = 'light' | 'primary';

interface GlowingIconButtonProps extends ButtonProps {
	glow?: boolean;
	glowVariant?: GlowVariant;
}

const glowStyles: Record<GlowVariant, string> = {
	light: 'shadow-[0_0_18px_rgba(255,255,255,0.25)] ring-1 ring-white/30',
	primary: 'shadow-[0_0_18px_rgba(var(--primary),0.35)] ring-1 ring-primary/50',
};

const GlowingIconButton = React.forwardRef<HTMLButtonElement, GlowingIconButtonProps>(
	(
		{
			className,
			variant = 'ghost',
			size = 'icon',
			asChild = false,
			glow = true,
			glowVariant = 'light',
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				ref={ref}
				className={cn(
					buttonVariants({ variant, size }),
					'h-11 w-11 md:h-12 md:w-12 rounded-full',
					glow && glowStyles[glowVariant],
					className
				)}
				{...props}
			/>
		);
	}
);

GlowingIconButton.displayName = 'GlowingIconButton';

export { GlowingIconButton };
export type { GlowingIconButtonProps };
