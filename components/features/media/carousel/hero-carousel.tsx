import type { Show } from '@/lib/types';
import type { TMDBImagesResponse, TMDBMovie, TMDBTVShow } from '@/lib/types/tmdb';

export interface HeroCarouselProps {
	shows: Array<
		Show & { media_type?: 'movie' | 'tv' } & (TMDBMovie &
				TMDBTVShow & { images?: TMDBImagesResponse })
	>;
	type: 'movie' | 'tv';
}
