export   interface Show {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  original_name: string;
  name: string;
  genres: any;
  tagline: string;
  media_type: string;
  overview: string;
  popularity: number;
  first_air_date: string;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  status?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  runtime?: number;
  budget?: number;
  revenue?: number;
  spoken_languages: any;
}

 export interface Season {
  season: number;
  isReleased: boolean;
  episodes: Episode[];
}

 export interface Episode {
   [x: string]:
     | string
     | number
     | boolean
     | readonly string[]
     | readonly number[]
     | readonly boolean[]
     | null
     | undefined;
   episode: number;
   releaseDate: any;
   id: string;
   title: string;
   description: string;
   img: any;
 }

 export interface SeasonTabsProps {
  seasons: Season[];
  id: string;
  tv_id: string;
}

export interface Anime {
  id: string;
  malId: number;
  title: {
    romaji: string;
    english: string;
    native: string;
    userPreferred: string;
  };
  image: string;
  imageHash: string;
  trailer: {
    id: string;
    site: "youtube";
    thumbnail: string;
    thumbnailHash: string;
  };
  description: string;
  status: "Ongoing" | "Completed";
  cover: string;
  coverHash: string;
  rating: number;
  releaseDate: number;
  color: string;
  genres: string[];
  totalEpisodes: number;
  duration: number;
  type: "TV" | "Movie";
  recommendations: Anime[];
  relations: Anime[];
}

export interface AnimeEpisode {
  id: string;
  animeID?: string;
  animeTitle?: string;
  episode: number;
  image: string;
  title?: string;
  number: number;
  description?: string;
  time: number;
  type?: string;
}
