export const tmdbImage = (
  path: string,
  type: "original" | "w500" | "w92" | 'string' = "original"
) => `https://image.tmdb.org/t/p/${type}/${path}`;
