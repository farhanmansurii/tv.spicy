/**
 * Streaming API Clients
 * For various streaming sources
 */

/**
 * Fetch links from Susflix
 */
export async function fetchSusflixLinks(movie: string) {
	try {
		const url = `https://susflix.tv/api/movie?id=${movie}`;
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // 1 hour
		});

		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching Susflix links:', error);
		return null;
	}
}

/**
 * Fetch VidSrc links
 */
export async function fetchVidSrc(
	type: 'movie' | 'tv',
	id: string,
	season: number | null = null,
	episode: number | null = null,
	callback?: (error: any, data?: any) => void
) {
	const apiBaseUrl = 'https://spicy-vidsrc-api.vercel.app/';
	const baseURL =
		type === 'movie'
			? `${apiBaseUrl}vsrcme/${id}`
			: `${apiBaseUrl}vsrcme/${id}?s=${season}&e=${episode}`;

	try {
		const response = await fetch(baseURL, {
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			throw new Error('Failed to fetch VidSrc links');
		}

		const data = await response.json();
		if (callback) {
			callback(null, data);
		}
		return data;
	} catch (error) {
		console.error('Error fetching VidSrc links:', error);
		if (callback) {
			callback(error);
		}
		throw error;
	}
}

