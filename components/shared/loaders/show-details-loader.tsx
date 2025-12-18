import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ShowDetailsLoader() {
    return (
        <div className="w-full animate-in fade-in duration-700 px-0">
            <div className={cn(
                'relative w-full overflow-hidden border border-border bg-background shadow-2xl',
                'aspect-[2/3] md:aspect-[21/9] lg:aspect-[16/7] rounded-hero md:rounded-hero-md'
            )}>
                <div className="absolute inset-0 z-0">
                    <Skeleton className="w-full h-full bg-muted/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />
                </div>

                <div className="relative z-10 h-full w-full flex flex-col justify-end p-6 md:p-10 lg:p-14">
                    <div className="max-w-4xl space-y-3 md:space-y-4 text-left">

                        <div className="space-y-2 md:space-y-3">
                            <Skeleton className="h-14 md:h-20 lg:h-28 w-[180px] md:w-[380px] lg:w-[480px] bg-muted/50 rounded-ui md:rounded-ui-md" />

                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-16 bg-muted/30" />
                                <Skeleton className="h-3 w-1 bg-muted/20" />
                                <Skeleton className="h-3 w-20 bg-muted/30" />
                                <Skeleton className="h-3 w-1 bg-muted/20" />
                                <Skeleton className="h-3 w-14 bg-muted/30" />
                            </div>

                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20 bg-muted/40 rounded" />
                                <Skeleton className="h-3 w-1 bg-muted/20" />
                                <Skeleton className="h-4 w-12 bg-muted/40 rounded" />
                                <Skeleton className="h-3 w-1 bg-muted/20" />
                                <Skeleton className="h-5 w-10 bg-muted/40 rounded" />
                            </div>
                        </div>

                        <div className="space-y-2 w-full max-w-2xl">
                            <Skeleton className="h-4 w-full bg-muted/30" />
                            <Skeleton className="h-4 w-5/6 bg-muted/30" />
                        </div>

                        <div className="pt-1 md:pt-2">
                            <div className="flex items-center h-[52px] md:h-[64px] bg-white/5 backdrop-blur-3xl rounded-full border border-white/5 p-1 md:p-1.5 w-full md:w-[450px]">
                                <Skeleton className="h-full flex-1 rounded-full bg-muted/40" />
                                <div className="h-1/2 w-px bg-white/10 mx-2" />
                                <Skeleton className="h-full aspect-square rounded-full bg-muted/40" />
                                <div className="h-1/2 w-px bg-white/10 mx-2 hidden md:block" />
                                <div className="hidden md:flex flex-1 items-center gap-2 px-2">
                                    <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-2 w-12 bg-muted/20" />
                                        <Skeleton className="h-3 w-20 bg-muted/40" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
