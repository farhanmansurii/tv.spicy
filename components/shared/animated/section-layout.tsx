'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import CommonTitle from '@/components/shared/animated/common-title';

interface SectionWrapperProps {
    title?: string;
    description?: string; // Optional subtitle/label
    headerAction?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    spacing?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * SectionWrapper provides a standardized vertical rhythm and title layout.
 * It ensures that the distance between sections is mathematically consistent.
 */
export default function SectionWrapper({
    title,
    description,
    headerAction,
    children,
    className,
    spacing = 'medium',
}: SectionWrapperProps) {
    const spacingStyles = {
        none: 'py-0',
        small: 'py-2 md:py-4',
        medium: 'py-4 md:py-8',
        large: 'py-8 md:py-12',
    };

    return (
        <section className={cn(spacingStyles[spacing], 'w-full', className)}>
            {title && (
                <div className="space-y-1 mb-6 md:mb-8">
                    {description && (
                        <CommonTitle
                            text={description}
                            variant="section"
                            spacing="none"
                        />
                    )}
                    <CommonTitle
                        text={title}
                        variant="small"
                        spacing="none"
                        as="h2"
                    >
                        {headerAction}
                    </CommonTitle>
                </div>
            )}
            <div className="w-full">
                {children}
            </div>
        </section>
    );
}
