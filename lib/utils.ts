import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Show } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchRowData(type: string) {
  try {
    const url = new URL(
      `https://api.themoviedb.org/3/${type}/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`
    );
    const response = await fetch(url.toString());
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
      `https://spicy-api.vercel.app/meta/tmdb/info/${id}?type=${type}`
    );
    const response = await fetch(url.toString());
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
    const response = await fetch(url.toString());
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
export async function fetchMovieLinks(movie: string, longID: string) {
  try {
    const url = new URL(
      `https://spicy-api.vercel.app/meta/tmdb/watch/${movie}?id=${longID}`
    );
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}
export async function getNewAndPopularShows() {
  const [topRatedTVres, topRatedMovieRes, trendingMovieRes, trendingTvRes] =
    await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=US&page=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&&watch_region=USpage=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=US&page=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&&watch_region=USpage=1`
      ),
    ]);

  if (
    !topRatedTVres.ok ||
    !topRatedMovieRes.ok ||
    !trendingMovieRes.ok ||
    !trendingTvRes.ok
  ) {
    throw new Error("Failed to fetch shows");
  }

  const [topRatedTV, topRatedMovie, trendingMovie, trendingTv] =
    (await Promise.all([
      topRatedTVres.json(),
      topRatedMovieRes.json(),
      trendingMovieRes.json(),
      trendingTvRes.json(),
    ])) as { results: Show[] }[];

  return {
    topRatedTV: topRatedTV?.results,
    topRatedMovie: topRatedMovie?.results,
    trendingTv: trendingTv?.results,
    trendingMovie: trendingMovie?.results,
  };
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
