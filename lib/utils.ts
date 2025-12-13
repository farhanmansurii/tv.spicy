import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Episode, Show } from './types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
const apiKey =
	'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlM2NhMGYyODNmMWFiOTAzZmQ1ZTIzMjRmYWFkZDg4ZSIsInN1YiI6IjYzMDAyNGYwN2Q0MWFhMDA3OWJkMjU3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w-Eb5kO6LneizQQA9A4VOr-0P6kqDsG4_ybU9Ym3tYo';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function fetchRowData(link: string) {
	try {
		const url = new URL(
			`https://api.themoviedb.org/3/${link}?language=en-US&include_adult=false&include_video=false`
		);
		const headers = {
			Authorization: `Bearer ${apiKey}`,
		};
		const response = await fetch(url.toString(), {
			headers,
			next: { revalidate: 60 * 60 * 24 * 7 },
		});
		if (!response.ok) {
			console.error(`API Error for ${link}: ${response.status} ${response.statusText}`);
			return [];
		}
		const data = await response.json();

		return data.results || [];
	} catch (error) {
		console.error(`Error fetching ${link}:`, error);
		return [];
	}
}
export function useRowData(link: string) {
	return useQuery({
		queryKey: ['rowData', link],
		queryFn: () => fetchRowData(link),
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24,
	});
}

export async function fetchDetails(id: string, type: string) {
	try {
		const url = new URL(
			`https://consumet-taupe-seven.vercel.app/meta/tmdb/info/${id}?type=${type}`
		);
		const response = await fetch(url.toString(), { cache: 'no-cache' });
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}
export async function fetchDetailsTMDB(id: string, type: string) {
	try {
		// Include images, videos, and watch providers using append_to_response
		const appendToResponse = [
			'images', // Logos, posters, backdrops
			'videos', // Trailers, teasers, clips
			'watch/providers', // Streaming availability
			'keywords', // Keywords for better SEO
			'external_ids', // IMDb, Facebook, Instagram, Twitter IDs
		].join(',');

		const url = new URL(
			`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=${appendToResponse}&include_image_language=en,null`
		);
		const response = await fetch(url.toString(), {
			cache: 'no-cache',
			next: { revalidate: 3600 }, // Revalidate every hour
		});
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

// Fetch full details for hero items (with logos and images)
export async function fetchHeroItemsWithDetails(
	shows: any[],
	type: 'tv' | 'movie',
	maxItems: number = 10
) {
	try {
		// Fetch full details for top items only (to get logos)
		const topShows = shows.slice(0, maxItems);
		const detailsPromises = topShows.map(
			(show) => fetchDetailsTMDB(show.id.toString(), type).catch(() => show) // Fallback to original if fetch fails
		);

		const detailsResults = await Promise.allSettled(detailsPromises);
		const enhancedShows = detailsResults.map((result, index) => {
			if (result.status === 'fulfilled' && result.value) {
				// Merge the full details with the original show data
				return { ...topShows[index], ...result.value };
			}
			// Fallback to original show if fetch failed
			return topShows[index];
		});

		// Return enhanced shows + remaining shows without details
		return [...enhancedShows, ...shows.slice(maxItems)];
	} catch (error) {
		console.error('Error fetching hero item details:', error);
		return shows; // Return original shows if all fails
	}
}
export async function fetchRecommendations(id: string, showType: string, type: string) {
	try {
		const url = new URL(
			`https://api.themoviedb.org/3/${showType}/${id}/${type}?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`
		);
		const response = await fetch(url.toString());
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

// Server-side version (uses process.env)
export async function fetchCredits(id: string, type: string) {
	try {
		const url = new URL(
			`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${process.env.TMDB_API_KEY}`
		);
		const response = await fetch(url.toString(), {
			next: { revalidate: 60 * 60 * 24 * 7 }, // Cache for 7 days
		});
		if (!response.ok) throw new Error('Failed to fetch credits');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

// Client-side version (for TanStack Query)
export async function fetchCreditsClient(id: string, type: string) {
	try {
		const API_KEY = 'e3ca0f283f1ab903fd5e2324faadd88e';
		const response = await fetch(
			`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`
		);
		if (!response.ok) throw new Error('Failed to fetch credits');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

// Server-side version (uses process.env)
export async function fetchVideos(id: string, type: string) {
	try {
		const url = new URL(
			`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${process.env.TMDB_API_KEY}`
		);
		const response = await fetch(url.toString(), {
			next: { revalidate: 60 * 60 * 24 * 7 }, // Cache for 7 days
		});
		if (!response.ok) throw new Error('Failed to fetch videos');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

// Client-side version (for TanStack Query)
export async function fetchVideosClient(id: string, type: string) {
	try {
		const API_KEY = 'e3ca0f283f1ab903fd5e2324faadd88e';
		const response = await fetch(
			`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
		);
		if (!response.ok) throw new Error('Failed to fetch videos');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}
export async function fetchMovieLinks(movie: string, longID: string, callback: any) {
	try {
		const url = new URL(
			`https://consumet-taupe-seven.vercel.app/movies/flixhq/watch?episodeId=${movie}&mediaId=${longID}&server=vidcloud`
		);
		const response = await fetch(url.toString());
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await response.json();
		callback(null, data);
	} catch (error) {
		callback(error);
	}
}
export async function fetchsusflixLinks(movie: string) {
	try {
		const url = new URL(`https://susflix.tv/api/movie?id=${movie}`);
		const response = await fetch(url.href);
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

export async function fetchShowData(endpoint: string) {
	const response = await fetch(
		`https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=US&page=1`,
		{ next: { revalidate: 21600 } }
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch data for ${endpoint}`);
	}

	const { results } = await response.json();
	return results;
}

export async function getNewAndPopularShows() {
	try {
		const topRatedTV = await fetchShowData('tv/top_rated');
		const topRatedMovie = await fetchShowData('movie/top_rated');
		const trendingMovie = await fetchShowData('trending/movie/week');
		const trendingTv = await fetchShowData('trending/tv/week');

		return {
			topRatedTV,
			topRatedMovie,
			trendingTv,
			trendingMovie,
		};
	} catch (error: any) {
		throw new Error('Failed to fetch shows: ' + error.message);
	}
}

export async function searchShows(query: string) {
	const res = await fetch(
		`https://api.themoviedb.org/3/search/multi?api_key=e3ca0f283f1ab903fd5e2324faadd88e&query=${encodeURIComponent(
			query
		)}`
	);

	if (!res.ok) {
		throw new Error('Failed to find shows');
	}

	const shows = (await res.json()) as { results: Show[] };

	const popularShows = shows.results.sort((a, b) => b.popularity - a.popularity);

	return {
		results: popularShows,
	};
}

export function formatRelativeTime(airDate: string): string {
	const now = new Date();
	const episodeDate = new Date(airDate);
	const timeDifference = episodeDate.getTime() - now.getTime();
	const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
	if (daysDifference > 1) {
		return `${daysDifference} days`;
	} else if (daysDifference === 1) {
		return '1 day';
	} else {
		const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
		if (hoursDifference >= 0) return `${hoursDifference} hours`;
		else return '';
	}
}

export async function fetchCarousalData(category: string, type: string) {
	try {
		const url = new URL(
			`https://api.themoviedb.org/3/${category}/${type}?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`
		);
		const headers = {
			Authorization: `Bearer ${apiKey}`,
		};
		const response = await fetch(url.toString(), {
			headers,
			next: { revalidate: 60 * 60 * 24 * 7 },
		});
		if (!response.ok) throw new Error('Failed to fetch data');
		const data = await fetchShowData('tv/top_rated');
		console.log(data);
		return data;
	} catch (error) {
		console.log(error);
	}
}

export async function fetchGenres(type: string) {
	if (!apiKey) {
		throw new Error('TMDB API key is missing');
	}
	const headers = {
		Authorization: `Bearer ${apiKey}`,
	};
	const res = await fetch(`https://api.themoviedb.org/3/genre/${type}/list?language=en`, {
		headers,
		next: { revalidate: 60 * 60 * 24 * 14 },
	});

	if (!res.ok) {
		throw new Error('Failed to find shows');
	}

	const genres = await res.json();
	return genres.genres;
}

export async function fetchGenreById(type: string, id: string, page: number = 1) {
	if (!apiKey) {
		throw new Error('TMDB API key is missing');
	}

	const headers = {
		Authorization: `Bearer ${apiKey}`,
	};

	const queryParams = new URLSearchParams({
		include_adult: 'true',
		include_video: 'false',
		language: 'en-US',
		page: page.toString(),
		sort_by: 'popularity.desc',
	});

	if (id) {
		queryParams.set('with_genres', id);
	}

	const url = `https://api.themoviedb.org/3/discover/${type}?${queryParams.toString()}`;

	const res = await fetch(url, { headers });

	if (!res.ok) {
		throw new Error('Failed to fetch shows');
	}

	const data = await res.json();
	return data.results;
}

export async function fetchVidSrc(
	type: string,
	id: string,
	season: number | null = null,
	episode: number | null = null,
	callback: any
) {
	const apiBaseUrl = 'https://spicy-vidsrc-api.vercel.app/';
	const baseURL =
		type === 'movie'
			? `${apiBaseUrl}vsrcme/${id}`
			: `${apiBaseUrl}vsrcme/${id}?s=${season}&e=${episode}`;
	try {
		const res = await fetch(baseURL);
		const data = await res.json();

		callback(null, data);
	} catch (error) {
		console.log('error', error);
		callback(error);
	}
}
export const fetchSeasonEpisodes = async (
	showId: string,
	seasonNumber: number
): Promise<Episode[]> => {
	try {
		const url = `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?language=en-US&api_key=${apiKey}`;
		const response = await axios.get(url);
		if (response.data && response.data.episodes) {
			return response.data.episodes;
		} else {
			throw new Error('No episodes data found in the response');
		}
	} catch (error) {
		console.error('Error fetching season episodes:', error);
		throw error;
	}
};
import * as Icons from 'lucide-react';

export function getLucideIcon(iconName: string) {
	return Icons[iconName as keyof typeof Icons] || Icons.Circle;
}
