'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const titleVariants = cva(
    'flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-4 transition-all duration-300',
    {
        variants: {
            variant: {
                default: 'text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-100',
                large: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-zinc-100',
                hero: 'text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] text-zinc-100',
                section: 'text-sm md:text-base font-medium text-zinc-300/90',
                small: 'text-base sm:text-lg md:text-xl font-semibold text-zinc-100',
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
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto transition-opacity duration-300 ease-out" style={{ willChange: 'opacity' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
