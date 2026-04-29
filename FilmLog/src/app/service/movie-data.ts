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
}

@Injectable({
  providedIn: 'root',
})
export class MovieData {
  // Note: This is a free API without authentication
  // Rate limited: https://imdb.iamidiotareyoutoo.com/

  constructor(private http: HttpClient) {}

  getMovies(searchQuery: string): Observable<Movie[]> {
    if (!searchQuery.trim()) {
      return throwError(() => new Error('Search query cannot be empty'));
    }

    const url = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchQuery)}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        // Transform API response to our Movie interface
        if (response && response.description && response.description.length > 0) {
          return response.description.map((item: any) => ({
            id: item['#IMDB_ID'] || item.id,
            title: item['#TITLE'] || item.title || 'Unknown Title',
            year: item['#YEAR'] || item.year || 'N/A',
            image: item['#IMG_POSTER'] || item.image || 'assets/default-poster.jpg',
            description: item['#ACTORS'] || item.description || 'No description available'
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
}
