import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type GlowVariant = 'light' | 'primary' | 'accent';

const buttonVariants = cva(
	// Base: cinematic character — tight tracking, semibold, purposeful transitions
	[
		'inline-flex items-center justify-center gap-2 whitespace-nowrap',
		'rounded-md text-sm font-semibold tracking-tight',
		'transition-all duration-150 ease-out',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
		'disabled:pointer-events-none disabled:opacity-40',
		'[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
		// Tactile feedback: subtle press-down
		'active:scale-[0.98]',
	],
	{
		variants: {
			variant: {
				// Primary CTA: white on black. The hero action.
				default:
					'bg-primary text-primary-foreground hover:bg-primary/[0.92] active:bg-primary/[0.85]',
				// Destructive: red signal. Use sparingly.
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/[0.92] active:bg-destructive/[0.85]',
				// Outline: border-only for secondary actions on dark surfaces.
				outline:
					'border border-white/10 bg-transparent text-foreground hover:bg-white/[0.06] hover:border-white/20 hover:text-white active:bg-white/[0.10]',
				// Secondary: dark surface with subtle border. For grouped actions.
				secondary:
					'bg-secondary text-secondary-foreground border border-white/[0.08] hover:bg-secondary/80 hover:border-white/[0.12] active:bg-secondary/70',
				// Ghost: minimal. For icon buttons, toolbar actions, low-emphasis.
				ghost:
					'text-foreground hover:bg-white/[0.06] hover:text-white active:bg-white/[0.10]',
				// Link: text-only navigation. No bg, no border.
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				// Touch target: 44px minimum
				default: 'h-11 px-6',
				sm: 'h-9 px-4 text-xs',
				lg: 'h-12 px-8 text-base',
				// Icon-only: square, still 44px
				icon: 'h-11 w-11 p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

const glowStyles: Record<GlowVariant, string> = {
	light: 'shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.22)] hover:-translate-y-px active:translate-y-0',
	primary:
		'shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_28px_rgba(255,255,255,0.18)] hover:-translate-y-px active:translate-y-0',
	accent:
		'shadow-[0_0_20px_rgba(255,255,255,0.10)] hover:shadow-[0_0_28px_rgba(255,255,255,0.16)] hover:-translate-y-px active:translate-y-0',
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	/** Purposeful glow for hero CTAs. Never default. */
	glow?: boolean;
	glowVariant?: GlowVariant;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant, size, asChild = false, glow = false, glowVariant = 'light', ...props },
		ref
	) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size }), glow && glowStyles[glowVariant], className)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = 'Button';

// GlowingButton kept as thin alias for backward compatibility.
// Prefer <Button glow> going forward.
const GlowingButton = React.forwardRef<
	HTMLButtonElement,
	Omit<ButtonProps, 'glow'> & { glowVariant?: GlowVariant; iconOnly?: boolean }
>(({ glowVariant = 'light', iconOnly = false, className, size, ...props }, ref) => (
	<Button
		ref={ref}
		glow
		glowVariant={glowVariant}
		size={iconOnly ? 'icon' : size}
		className={cn('rounded-full', className)}
		{...props}
	/>
));
GlowingButton.displayName = 'GlowingButton';

export { Button, buttonVariants, GlowingButton };
