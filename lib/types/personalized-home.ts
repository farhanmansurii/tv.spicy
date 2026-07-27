import type { ContinueWatchingItem } from '@/lib/continue-watching';

export interface PersonalizedWatchlistItem {
	mediaId: number;
	mediaType: string;
	title: string;
	posterPath?: string | null;
	backdropPath?: string | null;
	overview?: string | null;
}

export interface PersonalizedFavoriteItem {
	id: number;
	media_type: 'movie' | 'tv';
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
}

export interface PersonalizedHomeData {
	recentlyWatched: ContinueWatchingItem[];
	watchlist: PersonalizedWatchlistItem[];
	favorites: PersonalizedFavoriteItem[];
}

export interface UserSyncResponse {
	success: true;
	results: unknown;
	data: PersonalizedHomeData;
}
