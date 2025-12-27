'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const titleVariants = cva(
    'flex items-center justify-between w-full gap-4 transition-all duration-300',
    {
        variants: {
            variant: {
                default: 'text-3xl md:text-4xl font-semibold tracking-tight',
                large: 'text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter',
                hero: 'text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]',
                section: 'text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary/80',
                small: 'text-xl md:text-2xl font-bold tracking-tight text-white',
            },
            spacing: {
                none: 'mb-0',
                small: 'mb-4 md:mb-6',
                medium: 'mb-6 md:mb-10',
                large: 'mb-10 md:mb-14',
            }
        },
        defaultVariants: {
            variant: 'default',
            spacing: 'medium',
        },
    }
);

interface CommonTitleProps
    extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
    text: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
    children?: React.ReactNode; // Added for extra UI elements
}

export default function CommonTitle({
    text,
    variant,
    spacing,
    as: Component = 'h1',
    className,
    children,
    ...props
}: CommonTitleProps) {
    return (
        <div className={cn(titleVariants({ variant, spacing, className }))}>
            <Component className="flex-shrink-0">
                {text}
            </Component>

            {children && (
                <div className="flex items-center gap-4 animate-in fade-in duration-500">
                    {children}
                </div>
            )}
        </div>
    );
}
