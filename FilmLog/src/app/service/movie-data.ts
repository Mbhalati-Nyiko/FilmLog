import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Movie {
  id: string;
  title: string;
  year?: string;
  image?: string;
  description?: string;
  rating?: string;
  runtime?: string;
  genre?: string[];
  director?: string;
  cast?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MovieData {
  constructor(private http: HttpClient) {}

  getMovies(searchQuery: string): Observable<Movie[]> {
    if (!searchQuery.trim()) {
      return throwError(() => new Error('Search query cannot be empty'));
    }

    const url = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchQuery)}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.description && response.description.length > 0) {
          return response.description.map((item: any) => ({
            id: item['#IMDB_ID'] || item.id || `temp_${Math.random()}`,
            title: item['#TITLE'] || item.title || 'Unknown Title',
            year: item['#YEAR'] || item.year || 'N/A',
            image: item['#IMG_POSTER'] || item.image || 'assets/default-poster.jpg',
            description: this.safeDescription(item['#ACTORS'] || item.description)
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => new Error('Failed to fetch movies. Please try again.'));
      })
    );
  }

  // Safe description formatter
  private safeDescription(description: any): string {
    if (!description) {
      return 'No description available for this movie.';
    }

    if (typeof description === 'string') {
      return description.trim() || 'No description available for this movie.';
    }

    if (Array.isArray(description)) {
      return description.join(', ') || 'No description available for this movie.';
    }

    return 'No description available for this movie.';
  }
}
