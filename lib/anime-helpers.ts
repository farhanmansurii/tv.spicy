import axios from 'axios';

const baseUrl = 'https://apispicy.vercel.app/meta/anilist/';
export async function fetchAnimeByCategory(params: string, type: string, page: number) {
	try {
		const url = new URL(
			baseUrl +
				'advanced-search' +
				(type === 'season' ? `?${type}=${params}` : `?${type}=["${params}"]`) +
				`&page=${page}`
		);

		const response = await axios.get(url.toString());

		if (!response.data) {
			throw new Error('Failed to fetch data');
		}

		return response.data.results;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function fetchData(endpoint: string, sortByDate = false) {
	try {
		const url = new URL(endpoint, baseUrl);

		const response = await axios.get(url.toString());
		if (!response.data) {
			throw new Error('Failed to fetch data');
		}

		return sortByDate
			? response.data.sort((a: any, b: any) => {
					const aDate = a.release_date || a.first_air_date;
					const bDate = b.release_date || b.first_air_date;
					if (!aDate && !bDate) return 0;
					if (!aDate) return 1;
					if (!bDate) return -1;
					return new Date(bDate).getTime() - new Date(aDate).getTime();
				})
			: response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function fetchSearchQuery(query: string) {
	try {
		const url = `https://spicy-anime-api.vercel.app/anime/gogoanime/${query}`;

		const response = await axios.get(url);

		if (!response.data) {
			throw new Error('Failed to fetch data');
		}

		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function fetchLinks(id: string) {
	try {
		const response = await axios.get(baseUrl + `watch/${id}`, {});

		if (!response.data) {
			throw new Error('Failed to fetch data');
		}

		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
