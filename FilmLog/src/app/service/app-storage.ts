import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Movie } from '../pages/movie-details/movie-details.page';

import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AppStorage {
  private storageReady = new BehaviorSubject(false);
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {

    // await this.storage.defineDriver(cordovaSQLiteDriver);
    const storage = await this.storage.create();

    this._storage = storage;
    this.storageReady.next(true);
  }

    async addToWatched(movie: Movie): Promise<void> {
    try {
    const watched = await this.getWatchedMovies();
    if (!watched.find(m => m.id === movie.id)) {
      watched.push(movie);
      await this._storage?.set('watched_movies', watched);
      console.log('Movie added to watched:', movie.title);
    }
    } catch (error) {
    console.error('Error adding to watched:', error);
    }
    }

  async getWatchedMovies(): Promise<Movie[]> {
    try {
      return await this._storage?.get('watched_movies') || [];
    } catch (error) {
      console.error('Error getting watched movies:', error);
      return [];
    }
  }



  async removeFromWatched(movieId: string): Promise<void> {
    const watched = await this.getWatchedMovies();
    const filtered = watched.filter(m => m.id !== movieId);
    await this._storage?.set('watched_movies', filtered);
  }


  async isMovieWatched(movieId: string): Promise<boolean> {
    const watched = await this.getWatchedMovies();
    return watched.some(m => m.id === movieId);
  }

  // Watchlist
  async addToWatchlist(movie: Movie): Promise<void> {
    const watchlist = await this.getWatchlist();
    if (!watchlist.find(m => m.id === movie.id)) {
      watchlist.push(movie);
      await this._storage?.set('watchlist', watchlist);
    }
  }

  async removeFromWatchlist(movieId: string): Promise<void> {
    const watchlist = await this.getWatchlist();
    const filtered = watchlist.filter(m => m.id !== movieId);
    await this._storage?.set('watchlist', filtered);
  }

  async getWatchlist(): Promise<Movie[]> {
    return await this._storage?.get('watchlist') || [];
  }

  async isInWatchlist(movieId: string): Promise<boolean> {
    const watchlist = await this.getWatchlist();
    return watchlist.some(m => m.id === movieId);
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    await this._storage?.clear();
  }
}
