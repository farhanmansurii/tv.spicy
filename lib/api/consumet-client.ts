/**
 * Consumet API Client
 * For fetching streaming links and media info
 */

const CONSUMET_BASE_URL = 'https://consumet-taupe-seven.vercel.app';

/**
 * Fetch media details from Consumet
 */
export async function fetchDetails(id: string, type: 'movie' | 'tv') {
	try {
		const url = `${CONSUMET_BASE_URL}/meta/tmdb/info/${id}?type=${type}`;
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // 1 hour
		});

		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching details from Consumet:', error);
		return null;
	}
}

/**
 * Fetch movie streaming links
 */
export async function fetchMovieLinks(
	movie: string,
	longID: string,
	callback?: (error: any, data?: any) => void
) {
	try {
		const url = `${CONSUMET_BASE_URL}/movies/flixhq/watch?episodeId=${movie}&mediaId=${longID}&server=vidcloud`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch movie links');
		}

		const data = await response.json();
		if (callback) {
			callback(null, data);
		}
		return data;
	} catch (error) {
		if (callback) {
			callback(error);
		}
		throw error;
	}
}

