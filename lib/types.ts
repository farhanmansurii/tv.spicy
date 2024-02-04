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
  releaseDate: string | number | Date;
  id: string;
  title: string;
  description: string;
  img: {
    mobile: string;
    hd: string;
  };
}

 export interface SeasonTabsProps {
  seasons: Season[];
  id: string;
  tv_id: string;
}
