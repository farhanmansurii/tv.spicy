import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonProps } from '@/components/ui/button';

export type GlowVariant = 'light' | 'primary';

interface GlowingButtonProps extends ButtonProps {
	glow?: boolean;
	glowVariant?: GlowVariant;
	iconOnly?: boolean;
}

const glowStyles: Record<GlowVariant, string> = {
	light: 'shadow-[0_0_18px_rgba(255,255,255,0.35)] ring-1 ring-white/40',
	primary: 'shadow-[0_0_18px_rgba(var(--primary),0.4)] ring-1 ring-primary/60',
};

const GlowingButton = React.forwardRef<HTMLButtonElement, GlowingButtonProps>(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			asChild = false,
			glow = true,
			glowVariant = 'light',
			iconOnly = false,
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
					'rounded-full',
					iconOnly && 'h-11 w-11 md:h-12 md:w-12',
					glow && glowStyles[glowVariant],
					className
				)}
				{...props}
			/>
		);
	}
);

GlowingButton.displayName = 'GlowingButton';

export { GlowingButton };
export type { GlowingButtonProps };
