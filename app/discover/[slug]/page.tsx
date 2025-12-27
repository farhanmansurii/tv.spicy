import Container from '@/components/shared/containers/container';
import LoadMore from '@/components/features/media/load-more';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import CommonTitle from '@/components/shared/animated/common-title';
import SectionWrapper from '@/components/shared/animated/section-layout';

interface MetadataProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ type?: string; title?: string }>;
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
    const { slug } = await props.params;
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
    searchParams: Promise<{ type?: string; title?: string }>;
}

export default async function Page(props: PageProps) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const genreId = slug;
    const title = searchParams?.title;
    const type = searchParams?.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';
    const typeLabel = searchParams?.type?.toLowerCase() === 'movie' ? 'Movie' : 'TV Series';

    // Validate required parameters
    if (!title || !searchParams?.type || !genreId) {
        return notFound();
    }

    // Create params object with searchParams that includes id from slug
    const loadMoreParams = {
        params: props.params,
        searchParams: Promise.resolve({
            ...searchParams,
            id: genreId,
            type: searchParams.type,
            title: title,
        }),
    };

    return (
        <div className="min-h-screen">
            <Container>
                <SectionWrapper spacing="large" className="pb-0">
                    <div className="max-w-4xl space-y-2">
                        <CommonTitle
                            text={typeLabel}
                            variant="section"
                            spacing="none"
                        />
                        <CommonTitle
                            text={title}
                            variant="large"
                            className="text-white mb-0"
                            as="h1"
                        />
                        <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
                            A curated selection of the most immersive {title.toLowerCase()} {typeLabel.toLowerCase()} available.
                        </p>
                    </div>
                </SectionWrapper>

                <SectionWrapper spacing="medium">
                    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <LoadMore params={loadMoreParams} />
                    </div>
                </SectionWrapper>
            </Container>
        </div>
    );
}
