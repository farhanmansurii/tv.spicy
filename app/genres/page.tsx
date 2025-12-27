import { fetchGenres } from '@/lib/api';
import Container from '@/components/shared/containers/container';
import SectionWrapper from '@/components/shared/animated/section-layout';
import CommonTitle from '@/components/shared/animated/common-title';
import {
    Swords, Globe, Palette, Smile, BadgeAlert, Search,
    Clapperboard, Home, Zap, History, Ghost, Music,
    Heart, Rocket, Tv, Skull, Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Genre {
    id: number;
    name: string;
}

const getGenreIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('action')) return <Swords className="w-full h-full" />;
    if (n.includes('adventure')) return <Globe className="w-full h-full" />;
    if (n.includes('animation')) return <Palette className="w-full h-full" />;
    if (n.includes('comedy')) return <Smile className="w-full h-full" />;
    if (n.includes('crime')) return <BadgeAlert className="w-full h-full" />;
    if (n.includes('documentary')) return <Search className="w-full h-full" />;
    if (n.includes('drama')) return <Clapperboard className="w-full h-full" />;
    if (n.includes('family')) return <Home className="w-full h-full" />;
    if (n.includes('fantasy')) return <Zap className="w-full h-full" />;
    if (n.includes('history')) return <History className="w-full h-full" />;
    if (n.includes('horror')) return <Ghost className="w-full h-full" />;
    if (n.includes('music')) return <Music className="w-full h-full" />;
    if (n.includes('mystery')) return <Search className="w-full h-full" />;
    if (n.includes('romance')) return <Heart className="w-full h-full" />;
    if (n.includes('science fiction') || n.includes('sci-fi')) return <Rocket className="w-full h-full" />;
    if (n.includes('tv movie')) return <Tv className="w-full h-full" />;
    if (n.includes('thriller')) return <Skull className="w-full h-full" />;
    if (n.includes('war')) return <Swords className="w-full h-full" />;
    if (n.includes('western')) return <Mountain className="w-full h-full" />;
    return <Clapperboard className="w-full h-full" />;
};

const GenreCard = ({ genre, type }: { genre: Genre; type: 'movie' | 'tv' }) => {
    const Icon = getGenreIcon(genre.name);

    return (
        <Link
            href={`/discover/${genre.id}?type=${type}&title=${genre.name}`}
            className={cn(
                'group relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] border border-white/5 bg-zinc-900/20 transition-all duration-700',
                'hover:scale-[1.03] hover:bg-zinc-900/60 hover:border-primary/30 shadow-2xl backdrop-blur-3xl'
            )}
        >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Watermark Icon */}
            <div className="absolute -right-6 -bottom-6 h-36 w-36 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 transform text-white scale-110 group-hover:scale-125">
                {Icon}
            </div>

            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex items-center justify-between">
                    <div className="h-11 w-11 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-500 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                        {Icon}
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover:bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                </div>

                <div className="space-y-2 text-left">
                    <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors duration-500">
                        {genre.name}
                    </h3>
                    <div className="h-0.5 w-0 group-hover:w-16 bg-primary transition-all duration-700 rounded-full" />
                </div>
            </div>
        </Link>
    );
};

export default async function GenresPage() {
    const [movieGenres, tvGenres] = await Promise.all([
        fetchGenres('movie'),
        fetchGenres('tv')
    ]);

    return (
        <div className="min-h-screen mt-20">
            <Container>
                <SectionWrapper spacing="large" className="pb-4">
                    <div className="max-w-4xl space-y-6">
                        <div className="space-y-2">
                            <CommonTitle text="Curated Library" variant="section" spacing="none" />
                            <CommonTitle text="Explore Categories" variant="large" as="h1" className="text-white" />
                        </div>
                        <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
                            Dive into our extensive library organized by mood, style, and cinematic era.
                            Find your next obsession through professional curation.
                        </p>
                    </div>
                </SectionWrapper>

                {/* 3. Movie Grid Section */}
                <SectionWrapper
                    title="Movie Collections"
                    description="Archive"
                    spacing="medium"
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                        {movieGenres?.map((genre: Genre) => (
                            <GenreCard key={genre.id} genre={genre} type="movie" />
                        ))}
                    </div>
                </SectionWrapper>

                {/* 4. TV Grid Section */}
                <SectionWrapper
                    title="Series Collections"
                    description="Television"
                    spacing="medium"
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                        {tvGenres?.map((genre: Genre) => (
                            <GenreCard key={genre.id} genre={genre} type="tv" />
                        ))}
                    </div>
                </SectionWrapper>
            </Container>
        </div>
    );
}
