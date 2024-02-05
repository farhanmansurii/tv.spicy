import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Show } from "./types";
const apiKey =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlM2NhMGYyODNmMWFiOTAzZmQ1ZTIzMjRmYWFkZDg4ZSIsInN1YiI6IjYzMDAyNGYwN2Q0MWFhMDA3OWJkMjU3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w-Eb5kO6LneizQQA9A4VOr-0P6kqDsG4_ybU9Ym3tYo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchRowData(link: string) {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/${link}?language=en-USinclude_adult=false&include_video=false`
    );
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();

    return data.results;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchDetails(id: string, type: string) {
  try {
    const url = new URL(
      `https://api-spicy.vercel.app/meta/tmdb/info/${id}?type=${type}`
    );
    const response = await fetch(url.toString(), { cache: "no-cache" });
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
export async function fetchDetailsTMDB(id: string, type: string) {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}`
    );
    const response = await fetch(url.toString(), { cache: "no-cache" });
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
export async function fetchRecommendations(
  id: string,
  showType: string,
  type: string
) {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/${showType}/${id}/${type}?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`
    );
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
export async function fetchMovieLinks(
  movie: string,
  longID: string,
  callback: any
) {
  try {
    const url = new URL(
      `https://api-spicy.vercel.app/movies/flixhq/watch?episodeId=${movie}&mediaId=${longID}&server=vidcloud`
    );
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch data");
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
    if (!response.ok) throw new Error("Failed to fetch data");
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
    const topRatedTV = await fetchShowData("tv/top_rated");
    const topRatedMovie = await fetchShowData("movie/top_rated");
    const trendingMovie = await fetchShowData("trending/movie/week");
    const trendingTv = await fetchShowData("trending/tv/week");

    return {
      topRatedTV,
      topRatedMovie,
      trendingTv,
      trendingMovie,
    };
  } catch (error: any) {
    throw new Error("Failed to fetch shows: " + error.message);
  }
}

export async function searchShows(query: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=e3ca0f283f1ab903fd5e2324faadd88e&query=${encodeURIComponent(
      query
    )}`
  );

  if (!res.ok) {
    throw new Error("Failed to find shows");
  }

  const shows = (await res.json()) as { results: Show[] };

  const popularShows = shows.results.sort(
    (a, b) => b.popularity - a.popularity
  );

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
    return "1 day";
  } else {
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    if (hoursDifference >= 0) return `${hoursDifference} hours`;
    else return "";
  }
}

export async function fetchCarousalData(type: string) {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/${type}/movie?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`
    );
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchGenres(type: string) {
  if (!apiKey) {
    throw new Error("TMDB API key is missing");
  }
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };
  const res = await fetch(
    `https://api.themoviedb.org/3/genre/${type}/list?language=en`,
    { headers, next: { revalidate: 60 * 60 * 24 * 14 } }
  );

  if (!res.ok) {
    throw new Error("Failed to find shows");
  }

  const genres = await res.json();
  return genres.genres;
}

export async function fetchGenreById(
  type: string,
  id: string,
  page: number = 1
) {
  console.log(
    `https://api.themoviedb.org/3/discover/${type}/?include_adult=true&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${id}`
  );
  if (!apiKey) {
    throw new Error("TMDB API key is missing");
  }
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/${type}?include_adult=true&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${id}`,
    { headers, next: { revalidate: 60 * 60 * 24 * 7 } }
  );

  if (!res.ok) {
    throw new Error("Failed to find shows");
  }

  const genres = await res.json();
  return genres.results;
}
export async function fetchVidSrc(
  type: string,
  id: string,
  season: number | null = null,
  episode: number | null = null,
  callback: any
) {
  const corsAnywhereUrl = "https://proxy.anistreme.live/";
  const apiBaseUrl = "https://api-movie-source.vercel.app/";
  const url =
    type === "movie"
      ? `${corsAnywhereUrl}${apiBaseUrl}vsrcme/${id}`
      : `${corsAnywhereUrl}${apiBaseUrl}vsrcme/${id}?s=1&e=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();
    callback(null, data);
  } catch (error) {
    console.log("error", error);
    callback(error);
  }
}
