/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star } from 'lucide-react';
import BlurFade from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';

export default function MediaCard({
  index,
  show,
  isVertical,
  type,
  onClick,
}: {
  index: number;
  show: Show;
  isVertical?: boolean;
  type?: string;
  onClick?: (show: Show) => void;
}) {
  const mediaType = show.media_type || type;

  if (!mediaType) return <div className="bg-muted/20 animate-pulse rounded-card md:rounded-card-md aspect-video" />;

  const href = `/${mediaType}/${show.id}`;

  return (
    <Link
      href={href}
      onClick={() => onClick?.(show)}
      className="group block w-full outline-none perspective-1000 select-none"
    >
      <ShowCardContent
        show={show}
        index={index}
        isVertical={isVertical}
      />
    </Link>
  );
}

function ShowCardContent({
  show,
  index,
  isVertical,
}: {
  show: Show;
  index: number;
  isVertical?: boolean;
}) {
  const isMobile = useMediaQuery();
  const { title, name, backdrop_path, poster_path, first_air_date, release_date, vote_average } = show;

  // Logic:
  // - If isVertical is explicitly true: use poster
  // - If isVertical is explicitly false: use backdrop
  // - If isVertical is undefined: use poster on mobile, backdrop on desktop
  let imagePath: string | null = null;
  if (isVertical === true) {
    imagePath = poster_path;
  } else if (isVertical === false) {
    imagePath = backdrop_path;
  } else {
    // isVertical is undefined - use mobile/desktop logic
    imagePath = isMobile ? poster_path : backdrop_path;
  }

  const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;

  const displayTitle = title || name || 'Untitled';
  const year = (first_air_date || release_date)?.split('-')[0] || '';

  return (
    <div className="flex flex-col gap-3 w-full transition-transform duration-500 ease-out">
      <div
        className={cn(
          'relative w-full overflow-hidden bg-zinc-800 shadow-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
          'group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-[1.05] group-hover:-translate-y-1',
          'group-focus-visible:ring-4 group-focus-visible:ring-white/40',
          'rounded-card md:rounded-card-md',
          (isVertical === true || (isVertical === undefined && isMobile)) ? 'aspect-[2/3]' : 'aspect-video'
        )}
      >
        {imageUrl ? (
          <BlurFade key={imageUrl} delay={0.02 * index} inView className="h-full w-full">
            <img
              src={imageUrl}
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-card md:rounded-card-md ring-1 ring-inset ring-white/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </BlurFade>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-zinc-900 text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">No Preview</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1 transition-all duration-300 group-hover:translate-y-1">
        <h3 className="text-[15px] font-medium text-white/90 leading-tight truncate group-hover:text-white transition-colors">
          {displayTitle}
        </h3>

        <div className="flex items-center gap-2 text-[13px] text-zinc-400 font-medium">
          {year && <span>{year}</span>}
          {vote_average > 0 && (
            <>
              <span className="opacity-30">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-zinc-400 text-zinc-400" />
                <span>{vote_average.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
