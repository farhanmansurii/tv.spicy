import React from 'react';
import { Show } from '@/lib/types';
import { format } from 'date-fns';
import ContinueWatchingButton from '../features/watchlist/continue-watching-button';

interface CarousalCardProps {
  show: Show;
  isDetailsPage?: boolean;
  type?: string;
}

const CarousalCardWrapper = ({ show }: CarousalCardProps) => {
  if (!show) return null;

  const title = show.title || show.name || 'Untitled';
  const releaseDate = show.first_air_date || show.release_date;
  const year = releaseDate ? format(new Date(releaseDate), 'yyyy') : '';
  const backdrop = show.backdrop_path || show.poster_path || '';

  // Apple TV Style: Limit to 3 genres, separated by text
  const genres = show.genres?.slice(0, 3).map((gap: any) => g.name).join(' · ');

  return (
    <section className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-black font-sans">
      {/* --- 1. Hero Image with Slow Zoom --- */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={`https://image.tmdb.org/t/p/original/${backdrop}`}
          alt={title}
          className="h-full w-full object-cover object-center animate-subtle-zoom"
          style={{ animationDuration: '45s' }}
        />

        {/* --- 2. Apple-style Gradient Mesh ---
            This is critical. Instead of flat black, it's a smooth clear-to-dark ramp.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:via-background/20 lg:from-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent md:from-background/40" />
      </div>

      {/* --- 3. Content Layer --- */}
      <div className="relative z-10 flex h-full max-w-[1400px] mx-auto flex-col justify-end px-6 pb-20 md:px-12 md:pb-24">

        <div className="flex flex-col items-start gap-5 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-forwards">

          {/* Logo / Title Area */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-xl">
            {title}
          </h1>

          {/* Metadata Row: Clean and airy */}
          <div className="flex flex-wrap items-center gap-x-3 text-xs md:text-sm font-medium text-white/80">
            {show.vote_average > 0 && (
              <span className="text-white font-bold">{show.vote_average.toFixed(1)} Rating</span>
            )}
            <span className="text-white/40">·</span>
            <span>{year}</span>
            <span className="text-white/40">·</span>
            {genres && <span className="uppercase tracking-wide opacity-90">{genres}</span>}
            <span className=" border border-white/40 rounded px-1 py-0.5 text-[10px] leading-none text-white/60">
              HD
            </span>
          </div>

          {/* Overview - Short & Punchy */}
          {show.overview && (
            <p className="line-clamp-3 text-sm md:text-lg text-white/70 leading-relaxed md:leading-normal max-w-xl font-medium drop-shadow-md">
              {show.overview}
            </p>
          )}

          {/* Action Row - The "Apple" Buttons */}
          <div className="mt-4 flex items-center gap-3">
            {/* Primary Action (Play) - White Pill */}
            <div className="shadow-xl w-full shadow-white/5 transition-transform active:scale-95">
              <ContinueWatchingButton
                id={show.id}
                show={show}
                type={'tv'}
                isDetailsPage={true}
              />
            </div>


          </div>

        </div>
      </div>
    </section>
  );
};

export default CarousalCardWrapper;
