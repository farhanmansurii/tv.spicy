export const tmdbImage = (path: string, type: string = 'original') => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `https://image.tmdb.org/t/p/${type}${normalizedPath}`;
};
