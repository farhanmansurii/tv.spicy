import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type GlowVariant = 'light' | 'primary' | 'accent';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	glow?: boolean;
	glowVariant?: GlowVariant;
	iconOnly?: boolean;
	asChild?: boolean;
	variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link' | 'destructive';
	size?: 'default' | 'sm' | 'lg' | 'icon';
}

const glowStyles: Record<GlowVariant, string> = {
	light: 'shadow-[0_0_20px_rgba(255,255,255,0.2),0_0_6px_rgba(255,255,255,0.1)]',
	primary: 'shadow-[0_0_20px_rgba(255,255,255,0.15),0_0_6px_rgba(255,255,255,0.08)]',
	accent: 'shadow-[0_0_20px_rgba(255,255,255,0.12)]',
};

const GlowingButton = React.forwardRef<HTMLButtonElement, GlowingButtonProps>(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			asChild = false,
			glow = false,
			glowVariant = 'light',
			iconOnly = false,
			children,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				ref={ref}
				className={cn(
					// Base button styles override
					'relative inline-flex items-center justify-center',
					'overflow-hidden transition-all duration-200 ease-out',
					// Hover: slight lift + scale
					'hover:-translate-y-px active:scale-[0.98] active:translate-y-0',
					// Focus ring
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
					// Disabled
					'disabled:pointer-events-none disabled:opacity-50',
					// Shape
					'rounded-full',
					// Icon-only sizing
					iconOnly && 'h-11 w-11 md:h-12 md:w-12 flex-shrink-0',
					// Glow
					glow && glowStyles[glowVariant],
					className
				)}
				{...props}
			>
				{children}
			</Comp>
		);
	}
);

GlowingButton.displayName = 'GlowingButton';

export { GlowingButton };
export type { GlowingButtonProps };
