export interface WatchHistoryItem {
	id: number;
	name: string;
	episode_number: number;
	season_number: number;
	still_path?: string | null;
	show_name?: string;
	tv_id: string;
	time?: number;
}

export interface UserPreferences {
	favoriteGenres?: number[];
	preferredLanguage?: string;
	contentMaturity?: 'all' | 'teen' | 'adult';
}
