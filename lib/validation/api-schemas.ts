/**
 * Shared request-validation schemas for API route handlers.
 *
 * Routes parse query strings (`Object.fromEntries(searchParams)`) and JSON
 * bodies through these schemas instead of ad hoc regex/parseInt checks, so
 * malformed input consistently produces a 400 response instead of escaping as
 * a runtime error (NaN ids, JSON.parse throws, Prisma enum violations) and
 * 500 stays reserved for genuine server faults.
 */
import { z } from 'zod';

/** Media type accepted by watchlist, favorites and TMDB routes. */
export const mediaTypeSchema = z.enum(['movie', 'tv']);
export type MediaTypeValue = z.infer<typeof mediaTypeSchema>;

/** Positive TMDB id arriving as a JSON number or numeric string. */
const mediaIdSchema = z.coerce.number().int().positive();

/** TMDB id arriving as a query-string value (`id=603`, `genreId=28`). */
const tmdbIdSchema = z.string().regex(/^[1-9]\d*$/, 'must be a positive integer');

/** TMDB pagination (TMDB hard-caps pages at 500). */
const pageSchema = z.coerce.number().int().min(1).max(500);

// ---------------------------------------------------------------------------
// Watchlist / favorites
// ---------------------------------------------------------------------------

/** GET /api/watchlist, GET /api/favorites — optional `?type=movie|tv` filter. */
export const listFilterQuerySchema = z.object({
	type: mediaTypeSchema.optional(),
});

/** DELETE /api/watchlist, DELETE /api/favorites — `?mediaId=&mediaType=`. */
export const removeItemQuerySchema = z.object({
	mediaId: mediaIdSchema.optional(),
	mediaType: mediaTypeSchema.optional(),
});

/** POST /api/watchlist — accepts both camelCase and snake_case client shapes. */
export const watchlistAddBodySchema = z
	.object({
		mediaId: mediaIdSchema.optional(),
		id: mediaIdSchema.optional(),
		mediaType: mediaTypeSchema.optional(),
		posterPath: z.string().max(500).nullish(),
		poster_path: z.string().max(500).nullish(),
		backdropPath: z.string().max(500).nullish(),
		backdrop_path: z.string().max(500).nullish(),
		title: z.string().max(1000).optional(),
		name: z.string().max(1000).optional(),
		overview: z.string().max(10_000).nullish(),
	})
	.refine((body) => body.mediaId !== undefined || body.id !== undefined, {
		message: 'mediaId is required',
	})
	.refine((body) => Boolean(body.title?.trim() || body.name?.trim()), {
		message: 'title is required',
	});

/** POST /api/favorites. */
export const favoriteAddBodySchema = z
	.object({
		mediaId: mediaIdSchema.optional(),
		id: mediaIdSchema.optional(),
		mediaType: mediaTypeSchema.optional(),
	})
	.refine((body) => body.mediaId !== undefined || body.id !== undefined, {
		message: 'mediaId is required',
	});

// ---------------------------------------------------------------------------
// Recent searches
// ---------------------------------------------------------------------------

/** GET /api/recent-searches — `?limit=` must be an integer in [1, 100]. */
export const recentSearchesQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
});

/** POST /api/recent-searches. */
export const recentSearchAddBodySchema = z.object({
	query: z
		.string()
		.max(200, 'query must be at most 200 characters')
		.refine((value) => value.trim().length > 0, {
			message: 'query must be a non-empty string',
		}),
});

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

/** Per-list cap for POST /api/sync arrays (see REPORT.md). */
export const SYNC_MAX_ITEMS_PER_LIST = 1000;
/** Whole-body cap for POST /api/sync, enforced with 413. */
export const SYNC_MAX_BODY_BYTES = 1024 * 1024;

const syncListSchema = z.array(z.any()).max(SYNC_MAX_ITEMS_PER_LIST);

/** POST /api/sync — validates collection shape/size only; merge semantics live in the route. */
export const syncBodySchema = z.object({
	watchlist: syncListSchema.nullish(),
	recentlyWatched: syncListSchema.nullish(),
	favorites: syncListSchema.nullish(),
	recentSearches: syncListSchema.nullish(),
});

// ---------------------------------------------------------------------------
// TMDB routes
// ---------------------------------------------------------------------------

/** Row endpoints accepted by /api/tmdb/row (allow-list, not a free-form path). */
const rowEndpointSchema = z.string().regex(
	/^(?:trending\/(?:all|movie|tv)\/(?:day|week)|(?:movie|tv)\/(?:airing_today|on_the_air|popular|top_rated|upcoming|now_playing))$/,
	'invalid TMDB row endpoint'
);

/** GET /api/tmdb/row?endpoint=… */
export const tmdbRowQuerySchema = z.object({ endpoint: rowEndpointSchema });

/** GET /api/tmdb/genres?type=… */
export const tmdbGenresQuerySchema = z.object({ type: mediaTypeSchema });

/** GET /api/tmdb/genre?type=…&genreId=…&page=… */
export const tmdbGenreQuerySchema = z.object({
	type: mediaTypeSchema,
	genreId: tmdbIdSchema,
	page: pageSchema.default(1),
});

/** GET /api/tmdb/search?query=…&page=… */
export const tmdbSearchQuerySchema = z.object({
	query: z.string().trim().min(2).max(100),
	page: pageSchema.default(1),
});

/** GET /api/tmdb/details?id=…&type=… */
export const tmdbDetailsQuerySchema = z.object({
	id: tmdbIdSchema,
	type: mediaTypeSchema,
});

/** GET /api/tmdb/season?showId=…&season=… */
export const tmdbSeasonQuerySchema = z.object({
	showId: tmdbIdSchema,
	season: z.coerce.number().int().min(0).max(100),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** First human-readable message from a failed parse (for 400 responses). */
export function firstValidationError(error: z.ZodError): string {
	return error.issues[0]?.message ?? 'Invalid request';
}
