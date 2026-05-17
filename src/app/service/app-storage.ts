// src/app/service/app-storage.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from './authentication-service';
import { Movie } from 'src/app/models/movieModel';

export interface WatchlistItem {
  id: number;  // Database ID (integer)
  userId: number;
  title: string;
  poster: string;
  year: string;
  genre: string;
  cast: string;
  imdbID: string;
  addedAt: string;
}

export interface WatchedItem {
  id: number;  // Database ID (integer)
  userId: number;
  title: string;
  poster: string;
  year: string;
  genre: string;
  cast: string;
  imdbID: string;
  watchedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStorage {
  private apiUrl = 'http://localhost:5165/api';

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async addToWatched(movie: Movie): Promise<any> {
    const watchedItem = {
      title: movie.title,
      poster: movie.poster || movie.image,
      year: movie.year,
      genre: typeof movie.genre === 'string' ? movie.genre : (movie.genre || ''),
      cast: typeof movie.cast === 'string' ? movie.cast : (movie.cast || ''),
      imdbID: movie.imdbID || movie.id
    };

    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/watched`, watchedItem, { headers: this.getHeaders() })
    );
  }

  async removeFromWatched(databaseId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/watched/${databaseId}`, { headers: this.getHeaders() })
    );
  }

  async isMovieWatched(imdbId: string): Promise<boolean> {
    const watched = await this.getWatchedMovies();
    return watched.some(m => m.imdbID === imdbId);
  }

  async addToWatchlist(movie: Movie): Promise<any> {
    const watchlistItem = {
      title: movie.title,
      poster: movie.poster || movie.image,
      year: movie.year,
      genre: typeof movie.genre === 'string' ? movie.genre : (movie.genre || ''),
      cast: typeof movie.cast === 'string' ? movie.cast : (movie.cast || ''),
      imdbID: movie.imdbID || movie.id
    };

    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/watchlist`, watchlistItem, { headers: this.getHeaders() })
    );
  }

  async removeFromWatchlist(databaseId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/watchlist/${databaseId}`, { headers: this.getHeaders() })
    );
  }

  async getWatchedMovies(): Promise<Movie[]> {
    const response = await firstValueFrom(
      this.http.get<WatchedItem[]>(`${this.apiUrl}/watched`, { headers: this.getHeaders() })
    );

    return response.map(item => ({
      id: item.imdbID,  // For display, use imdbID as string ID
      imdbID: item.imdbID,
      title: item.title,
      year: item.year,
      image: item.poster,
      poster: item.poster,
      description: `${item.title} (${item.year})`,
      cast: item.cast || 'No cast information',
      genre: item.genre,
      watchedItemId: item.id  // Store database ID for deletion
    }));
  }

  async getWatchlist(): Promise<Movie[]> {
    const response = await firstValueFrom(
      this.http.get<WatchlistItem[]>(`${this.apiUrl}/watchlist`, { headers: this.getHeaders() })
    );

    return response.map(item => ({
      id: item.imdbID,  // For display, use imdbID as string ID
      imdbID: item.imdbID,
      title: item.title,
      year: item.year,
      image: item.poster,
      poster: item.poster,
      description: `${item.title} (${item.year})`,
      cast: item.cast || 'No cast information',
      genre: item.genre,
      watchlistItemId: item.id  // Store database ID for deletion
    }));
  }

  async isInWatchlist(imdbId: string): Promise<boolean> {
    const watchlist = await this.getWatchlist();
    return watchlist.some(m => m.imdbID === imdbId);
  }

  async moveFromWatchlistToWatched(movie: Movie): Promise<boolean> {
    try {
      await this.addToWatched(movie);
      if (movie.watchlistItemId) {
        await this.removeFromWatchlist(movie.watchlistItemId);
      }
      return true;
    } catch (error) {
      console.error('Error moving movie:', error);
      return false;
    }
  }
}
