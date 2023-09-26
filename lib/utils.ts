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
export async function fetchMovie(id: string) {
  try {
    const url = new URL(
      `https://spicyapi.vercel.app/meta/tmdb/info/${id}?type=MOVIE`
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
      // `https://spicyapi.vercel.app/meta/tmdb/watch/${movie}?id=${longID}`
      `https://api.consumet.org/meta/tmdb/watch/${movie}?id=${longID}`
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
  const [popularTvRes, popularMovieRes, trendingTvRes, trendingMovieRes] =
    await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=US&page=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&watch_region=US&page=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/trending/tv/day?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&&watch_region=USpage=1`
      ),
      fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&&watch_region=USpage=1`
      ),
    ]);

  if (
    !popularTvRes.ok ||
    !popularMovieRes.ok ||
    !trendingTvRes.ok ||
    !trendingMovieRes.ok
  ) {
    throw new Error("Failed to fetch shows");
  }

  const [popularTvs, popularMovies, trendingTvs, trendingMovies] =
    (await Promise.all([
      popularTvRes.json(),
      popularMovieRes.json(),
      trendingTvRes.json(),
      trendingMovieRes.json(),
    ])) as { results: Show[] }[];

  return {
    popularTvs: popularTvs?.results,
    popularMovies: popularMovies?.results,
    trendingTvs: trendingTvs?.results,
    trendingMovies: trendingMovies?.results,
  };
}

export async function searchShows(query: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${ process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
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
