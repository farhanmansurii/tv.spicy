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
