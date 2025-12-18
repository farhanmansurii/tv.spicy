import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ShowDetailsLoader() {
    return (
        <div className="relative w-full overflow-hidden group rounded-hero md:rounded-hero-md">
            <div className={cn(
                "relative w-full transition-transform duration-1000 ease-out overflow-hidden",
                "aspect-[2/3] md:aspect-video lg:aspect-[16/8]",
                'rounded-hero md:rounded-hero-md',
            )}>
                <Skeleton className="w-full h-full bg-muted/40 rounded-hero md:rounded-hero-md" />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/20 md:to-transparent rounded-hero md:rounded-hero-md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent hidden md:block rounded-hero md:rounded-hero-md" />

                {/* Gradient blur effect similar to episode card */}
                <div
                    className={cn(
                        "absolute inset-0 z-10 transition-opacity duration-500 rounded-hero md:rounded-hero-md",
                        "backdrop-blur-[5px] opacity-100"
                    )}
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
                    }}
                />
            </div>

            <div className={cn(
                "absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-16 md:pb-20",
                "items-center text-center md:items-start md:text-left z-20"
            )}>
                <div className="w-full max-w-[280px] md:max-w-[300px] mb-2 md:mb-4 lg:max-w-[500px] flex items-center justify-center md:block">
                    <Skeleton className="h-12 md:h-24 w-[180px] md:w-[300px] bg-white/10 rounded-ui md:rounded-ui-md" />
                </div>

                <div className="flex items-center gap-2 text-white/70 mb-2 flex-wrap justify-center md:justify-start md:mb-4">
                    <Skeleton className="h-6 w-20 bg-white/10 rounded-card" />
                    <Skeleton className="h-4 w-1 bg-white/20" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 mb-2 md:mb-4 w-full md:w-auto">
                    <Skeleton className="h-11 w-full md:w-48 bg-white/10 rounded-lg" />
                </div>

                <div className="max-w-2xl space-y-3">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-white/10" />
                        <Skeleton className="h-4 w-5/6 bg-white/10" />
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                        <Skeleton className="h-5 w-12 bg-white/10 rounded-sm" />
                        <Skeleton className="h-4 w-1 bg-white/20" />
                        <Skeleton className="h-5 w-16 bg-white/10 rounded-sm" />
                        <Skeleton className="h-4 w-1 bg-white/20" />
                        <Skeleton className="h-5 w-10 bg-white/10 rounded-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
