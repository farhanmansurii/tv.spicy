import Container from '@/components/shared/containers/container';
import LoadMore from '@/components/features/media/load-more';
import { Metadata } from 'next';
import React from 'react';
import CommonTitle from '@/components/shared/animated/common-title';

interface MetadataProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ type?: string; id?: string; title?: string }>;
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const title = searchParams?.title || 'Discover';
    const type = searchParams?.type?.toLowerCase() === 'movie' ? 'Movies' : 'TV Shows';

    return {
        title: `${title} ${type} | SpicyTV`,
        description: `Explore our curated collection of ${title} ${type.toLowerCase()}.`,
    };
}

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ type?: string; id?: string; title?: string }>;
}

export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;
    const title = searchParams?.title;
    const type = searchParams?.type?.toLowerCase() === 'movie' ? 'Movie' : 'TV Series';

    if (!title || !searchParams?.type || !searchParams?.id) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Container className="w-full space-y-8 md:space-y-12 py-8 md:py-12">
                <div className="space-y-4 max-w-4xl">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-primary rounded-full" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Browse {type}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <CommonTitle
                            text={title}
                            variant="xl"
                            as="h1"
                            className="tracking-tighter"
                        />
                        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl">
                            A curated selection of the most immersive {title.toLowerCase()} {type.toLowerCase()} available.
                        </p>
                    </div>
                </div>

                <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <LoadMore params={props} />
                </div>
            </Container>
        </div>
    );
}
