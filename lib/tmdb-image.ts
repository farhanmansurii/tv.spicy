export const tmdbImage = (path: string, type: string = 'original') => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `https://image.tmdb.org/t/p/${type}${normalizedPath}`;
};

const TMDB_RESPONSIVE_WIDTHS = [300, 500, 780] as const;

/**
 * Build the responsive image candidates used by media cards.
 * Keep the explicit widths aligned with the TMDB CDN sizes so the browser can
 * choose the smallest suitable asset for the card's rendered width and DPR.
 */
export const tmdbImageSrcSet = (path: string) =>
	TMDB_RESPONSIVE_WIDTHS.map((width) => `${tmdbImage(path, `w${width}`)} ${width}w`).join(', ');
