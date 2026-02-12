import Container from '@/components/shared/containers/container';
import { fetchRowData } from '@/lib/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import MediaRow from '@/components/features/media/row/media-row';
import { Show } from '@/lib/types';
import CommonTitle from '@/components/shared/animated/common-title';
import SectionWrapper from '@/components/shared/animated/section-layout';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const categoryMap: Record<
    string,
    { endpoint: string; title: string; type: 'tv' | 'movie'; description: string; label: string }
> = {
    'binge-worthy-series': {
        endpoint: 'trending/tv/week',
        title: 'Binge-Worthy Series',
        label: 'Trending Now',
        type: 'tv',
        description: 'Discover the most trending TV series this week',
    },
    'crowd-favorites-tv': {
        endpoint: 'tv/popular',
        title: 'Crowd Favorites',
        label: 'Television',
        type: 'tv',
        description: 'Popular TV shows loved by audiences worldwide',
    },
    'critically-acclaimed-tv': {
        endpoint: 'tv/top_rated',
        title: 'Critically Acclaimed',
        label: 'Critics Choice',
        type: 'tv',
        description: 'Top-rated TV shows with the highest critical acclaim',
    },
    'blockbuster-hits': {
        endpoint: 'trending/movie/week',
        title: 'Blockbuster Hits',
        label: 'Cinema',
        type: 'movie',
        description: 'The most trending movies this week',
    },
    'fresh-in-theaters': {
        endpoint: 'movie/now_playing',
        title: 'Fresh in Theaters',
        label: 'New Releases',
        type: 'movie',
        description: 'Movies currently playing in theaters',
    },
    'cinema-hall-of-fame': {
        endpoint: 'movie/top_rated',
        title: 'Hall of Fame',
        label: 'Classics',
        type: 'movie',
        description: 'Top-rated movies with the highest critical acclaim',
    },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = categoryMap[slug];
    return {
        title: category ? `${category.title} | Browse` : 'Browse',
        description: category?.description || 'Browse content',
    };
}

export default async function BrowsePage({ params }: PageProps) {
    const { slug } = await params;
    const category = categoryMap[slug];

    if (!category) return notFound();

    let shows: unknown[] = [];
    let hasFetchError = false;

    try {
        const data = await fetchRowData(category.endpoint);
        shows = Array.isArray(data) ? data : [];
    } catch {
        hasFetchError = true;
    }

    if (hasFetchError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="text-center space-y-6">
                    <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/20">
                        <CommonTitle text="!" variant="small" />
                    </div>
                    <div className="space-y-2">
                        <CommonTitle text="Sync Error" variant="small" />
                        <p className="text-zinc-500 text-xs uppercase font-black tracking-widest leading-loose">
                            Failed to reach the archive.<br/>Please check your connection.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (shows.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <CommonTitle text="No Content Found" variant="small" />
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Archive Empty</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* 1. HERO HEADER SECTION */}
            <SectionWrapper spacing="large" className="pb-0">
                <Container>
                    <div className="max-w-4xl space-y-4">
                        <CommonTitle
                            text={category.label}
                            variant="section"
                            spacing="none"
                        />
                        <CommonTitle
                            text={category.title}
                            variant="large"
                            as="h1"
                            className="text-white"
                        />
                        <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
                            {category.description}
                        </p>
                    </div>
                </Container>
            </SectionWrapper>

            {/* 2. GRID CONTENT SECTION */}
            <SectionWrapper spacing="medium">
                <Container>
                    <MediaRow
                        shows={shows as Show[]}
                        type={category.type}
                        isVertical={true}
                        gridLayout={true}
                        hideHeader={true}
                    />
                </Container>
            </SectionWrapper>
        </div>
    );
}
