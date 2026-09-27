import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type GlowVariant = 'light' | 'primary' | 'accent';

const buttonVariants = cva(
	[
		'inline-flex items-center justify-center gap-2 whitespace-nowrap',
		'rounded-full text-sm font-semibold tracking-tight',
		'transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out',
		'disabled:pointer-events-none disabled:opacity-40',
		'[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
		'active:scale-97 motion-reduce:active:scale-100',
	],
	{
		variants: {
			variant: {
				default:
					'bg-brand text-brand-foreground can-hover:bg-brand-hover active:bg-brand-hover',
				brand: 'bg-brand text-brand-foreground can-hover:bg-brand-hover active:bg-brand-hover',
				destructive:
					'bg-destructive text-destructive-foreground can-hover:bg-destructive/[0.92] active:bg-destructive/[0.85]',
				outline:
					'border border-border-strong bg-transparent text-foreground can-hover:bg-foreground/[0.06] can-hover:border-foreground/20 can-hover:text-foreground active:bg-foreground/[0.10]',
				secondary:
					'bg-secondary text-secondary-foreground border border-border can-hover:bg-secondary/80 can-hover:border-border-strong active:bg-secondary/70',
				ghost:
					'bg-foreground/[0.08] border border-border-strong text-foreground backdrop-blur-md can-hover:bg-foreground/[0.14] can-hover:border-foreground/40 active:bg-foreground/[0.10]',
				link: 'text-primary underline-offset-4 can-hover:underline',
				glass: 'rounded-full border border-border bg-foreground/[0.06] text-foreground/70 can-hover:bg-foreground/[0.10] can-hover:text-foreground can-hover:border-border-strong active:bg-foreground/[0.14]',
			},
			shape: { default: '', pill: 'rounded-full' },
			size: {
				default: 'h-12 px-6 rounded-full font-semibold text-base gap-2.5',
				sm: 'h-9 px-4 text-micro rounded-full',
				lg: 'h-12 px-8 text-base rounded-full',
				xl: 'h-12 px-5 text-base rounded-full md:h-13 md:px-8',
				icon: 'hit-target h-10 w-10 p-0 rounded-full',
				'icon-lg': 'hit-target size-12 p-0 rounded-full',
			},
		},
		compoundVariants: [
			{
				variant: 'ghost',
				size: 'icon',
				className:
					'border border-border-strong bg-background/40 can-hover:bg-foreground/[0.14] can-hover:border-foreground/50 disabled:text-muted-foreground disabled:opacity-50',
			},
			{
				variant: 'ghost',
				size: 'icon-lg',
				className:
					'border border-border-strong bg-background/40 can-hover:bg-foreground/[0.14] can-hover:border-foreground/50 disabled:text-muted-foreground disabled:opacity-50',
			},
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			shape: 'default',
		},
	}
);

const glowStyles: Record<GlowVariant, string> = {
	light: 'shadow-glow-light can-hover:shadow-glow-light-hover can-hover:-translate-y-px active:translate-y-0',
	primary: 'shadow-glow-primary can-hover:shadow-glow-primary-hover can-hover:-translate-y-px active:translate-y-0',
	accent: 'shadow-glow-accent can-hover:shadow-glow-accent-hover can-hover:-translate-y-px active:translate-y-0',
};

type ButtonProps = React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		/** Purposeful glow for hero CTAs. Never default. */
		glow?: boolean;
		glowVariant?: GlowVariant;
	};

function Button({
	className,
	variant = 'default',
	size = 'default',
	shape = 'default',
	asChild = false,
	glow = false,
	glowVariant = 'light',
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot.Root : 'button';
	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				buttonVariants({ variant, size, shape }),
				glow && glowStyles[glowVariant],
				className
			)}
			{...props}
		/>
	);
}

export { Button, buttonVariants, type ButtonProps };
