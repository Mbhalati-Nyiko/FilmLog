// src/app/service/movie-data.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Movie, OmdbSearchResponse, OmdbMovieDetail } from 'src/app/models/movieModel';
import { AuthenticationService } from './authentication-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieData {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) { }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.authService.getToken()}`
    };
  }

  searchMovies(searchQuery: string, page: number = 1): Observable<OmdbSearchResponse> {
    if (!searchQuery.trim()) {
      return throwError(() => new Error('Search query cannot be empty'));
    }

    const params = new HttpParams()
      .set('title', searchQuery.trim())
      .set('page', page.toString());

    return this.http.get<OmdbSearchResponse>(`${this.apiUrl}/movies/search`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Search API Error:', error);
        let errorMessage = 'Failed to fetch movies';
        if (error.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          this.authService.logout();
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getMovieDetails(imdbId?: string): Observable<OmdbMovieDetail> {
    return this.http.get<OmdbMovieDetail>(`${this.apiUrl}/movies/${imdbId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Movie details error:', error);
        let errorMessage = 'Failed to fetch movie details';
        if (error.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          this.authService.logout();
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Add detailed movie search with full info
  async searchMoviesWithDetails(searchQuery: string): Promise<Movie[]> {
    try {
      const response = await this.searchMovies(searchQuery).toPromise();

      if (response?.Response === 'True' && response.Search) {
        // Fetch details for each movie (limit to first 10 for performance)
        const moviesWithDetails = await Promise.all(
          response.Search.slice(0, 10).map(async (movie) => {
            try {
              const details = await this.getMovieDetails(movie.imdbID).toPromise();
              return this.mapToMovie(movie, details);
            } catch {
              return this.mapToMovie(movie);
            }
          })
        );
        return moviesWithDetails;
      }
      return [];
    } catch (error) {
      console.error('Search with details error:', error);
      return [];
    }
  }

  private mapToMovie(omdbMovie: any, details?: OmdbMovieDetail): Movie {
    return {
      id: omdbMovie.imdbID,
      imdbID: omdbMovie.imdbID,
      title: omdbMovie.Title,
      year: omdbMovie.Year,
      image: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : 'assets/default-poster.jpg',
      poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : 'assets/default-poster.jpg',
      description: details?.Plot || `${omdbMovie.Title} (${omdbMovie.Year})`,
      cast: details?.Actors || '',
      genre: details?.Genre || '',
      rating: details?.imdbRating,
      runtime: details?.Runtime,
      director: details?.Director
    };
  }
}
