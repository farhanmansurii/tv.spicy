/**
 * Centralized API exports
 * Import all API functions from here
 */

// TMDB API
export {
	fetchRowData,
	fetchDetailsTMDB,
	fetchBasicDetailsTMDB,
	fetchTMDBImages,
	fetchRecommendations,
	fetchCredits,
	fetchVideos,
	fetchGenres,
	fetchGenreById,
	searchTMDB,
	discoverMedia,
	fetchSeasonEpisodes,
	fetchEpisodeDetails,
	fetchHeroItemsWithDetails,
	getNewAndPopularShows,
	type MediaType,
	type TimeWindow,
	type DiscoverOptions,
} from './tmdb-client';

// Consumet API
export { fetchDetails, fetchMovieLinks } from './consumet-client';

// Streaming APIs
export { fetchSusflixLinks } from './streaming-client';
