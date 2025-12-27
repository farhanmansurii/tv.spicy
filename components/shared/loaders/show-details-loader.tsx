import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/containers/container';

export default function ShowDetailsLoader() {
    return (
        <section className={cn(
            "relative w-full overflow-hidden bg-zinc-950",
            "h-[75vh] md:h-[80vh] lg:h-[85vh]"
        )}>
            <div className="absolute inset-0 z-0">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_left_center,rgba(9,9,11,0.8)_0%,transparent_75%)]" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end">
                <Container className="pb-10 md:pb-20">
                    <div className="max-w-4xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        {/* Badge and Meta */}
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3 md:mb-5">
                            <Skeleton className="h-5 w-16 rounded-sm" />
                            <div className="flex items-center gap-2.5">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-5 w-8 rounded-sm" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col items-center md:items-start">
                            <Skeleton className="h-12 md:h-24 w-[200px] md:w-[400px] mb-3 md:mb-4" />
                            <Skeleton className="h-3 md:h-4 w-[150px] md:w-[200px]" />
                        </div>

                        {/* Overview */}
                        <div className="max-w-2xl hidden md:block mt-6 md:mt-8">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-5/6" />
                                <Skeleton className="h-5 w-4/5" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center md:justify-start mt-8 md:mt-10 gap-2.5">
                            <Skeleton className="h-[42px] md:h-[50px] w-[120px] md:w-[140px] rounded-full" />
                            <Skeleton className="h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full" />
                            <Skeleton className="h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full" />
                        </div>
                    </div>
                </Container>
            </div>
        </section>
    );
}
