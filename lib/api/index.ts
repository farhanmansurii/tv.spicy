/**
 * Shared catalog helpers.
 * Stream link helpers stay on this barrel.
 */

export { fetchRowData, fetchGenres, type MediaType } from './tmdb-client';

export { fetchDetails, fetchMovieLinks } from './consumet-client';

export { fetchSusflixLinks } from './streaming-client';
