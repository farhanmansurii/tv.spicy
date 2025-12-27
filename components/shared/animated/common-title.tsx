'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const titleVariants = cva(
    'flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-4 transition-all duration-300',
    {
        variants: {
            variant: {
                default: 'text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight',
                large: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter',
                hero: 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]',
                section: 'text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-primary/80',
                small: 'text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white',
            },
            spacing: {
                none: 'mb-0',
                small: 'mb-3 sm:mb-4 md:mb-6',
                medium: 'mb-4 sm:mb-6 md:mb-8',
                large: 'mb-6 sm:mb-8 md:mb-8 lg:mb-12',
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
            <Component className="flex-shrink-0 w-full sm:w-auto">
                {text}
            </Component>

            {children && (
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto animate-in fade-in duration-500">
                    {children}
                </div>
            )}
        </div>
    );
}
