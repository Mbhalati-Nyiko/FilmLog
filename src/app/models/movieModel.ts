// src/app/models/movieModel.ts
export interface Movie {
  id?: string;  // imdbID for display
  imdbID?: string;
  title: string;
  year: string;
  image?: string;
  poster?: string;
  description?: string;
  cast?: string | string[];
  genre?: string;
  watchedItemId?: number;  // Database ID for deletion
  watchlistItemId?: number;  // Database ID for deletion
  isWatched?: boolean;
  isInWatchlist?: boolean;
  rating?: string;
  runtime?: string;
  director?: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response?: string;
  Error?: string;
}

export interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbMovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Response: string;
}
