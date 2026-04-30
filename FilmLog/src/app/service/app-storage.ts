import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Movie } from '../pages/movie-details/movie-details.page';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from './authentication-service';

@Injectable({
  providedIn: 'root'
})
export class AppStorage {
  private storageReady = new BehaviorSubject(false);
  private _storage: Storage | null = null;

  constructor(
    private storage: Storage,
    private authService: AuthenticationService  // Inject auth service
  ) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.storageReady.next(true);
  }

  // Get current user ID from auth service
  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.username : null; // Using username as unique identifier
  }

  // Get user-specific storage key
  private getUserKey(baseKey: string): string {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }
    return `${userId}_${baseKey}`;
  }

  // Watched Movies - User Specific
  async addToWatched(movie: Movie): Promise<void> {
    try {
      const key = this.getUserKey('watched_movies');
      const watched = await this.getWatchedMovies();
      if (!watched.find(m => m.id === movie.id)) {
        watched.push(movie);
        await this._storage?.set(key, watched);
        console.log(`Movie added to watched for user ${this.getCurrentUserId()}`);
      }
    } catch (error) {
      console.error('Error adding to watched:', error);
    }
  }

  async removeFromWatched(movieId: string): Promise<void> {
    try {
      const key = this.getUserKey('watched_movies');
      const watched = await this.getWatchedMovies();
      const filtered = watched.filter(m => m.id !== movieId);
      await this._storage?.set(key, filtered);
    } catch (error) {
      console.error('Error removing from watched:', error);
    }
  }

  async getWatchedMovies(): Promise<Movie[]> {
    try {
      const key = this.getUserKey('watched_movies');
      return await this._storage?.get(key) || [];
    } catch (error) {
      console.error('Error getting watched movies:', error);
      return [];
    }
  }

  async isMovieWatched(movieId: string): Promise<boolean> {
    try {
      const watched = await this.getWatchedMovies();
      return watched.some(m => m.id === movieId);
    } catch (error) {
      return false;
    }
  }

  // Watchlist - User Specific
  async addToWatchlist(movie: Movie): Promise<void> {
    try {
      const key = this.getUserKey('watchlist');
      const watchlist = await this.getWatchlist();
      if (!watchlist.find(m => m.id === movie.id)) {
        watchlist.push(movie);
        await this._storage?.set(key, watchlist);
        console.log(`Movie added to watchlist for user ${this.getCurrentUserId()}`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  }

  async removeFromWatchlist(movieId: string): Promise<void> {
    try {
      const key = this.getUserKey('watchlist');
      const watchlist = await this.getWatchlist();
      const filtered = watchlist.filter(m => m.id !== movieId);
      await this._storage?.set(key, filtered);
      console.log(`Movie removed from watchlist for user ${this.getCurrentUserId()}`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }

  async getWatchlist(): Promise<Movie[]> {
    try {
      const key = this.getUserKey('watchlist');
      return await this._storage?.get(key) || [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  async isInWatchlist(movieId: string): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist();
      return watchlist.some(m => m.id === movieId);
    } catch (error) {
      return false;
    }
  }

  // Clear user data on logout
  async clearUserDataOnLogout(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (userId) {
        // Don't delete the data, just let it stay for next login
        console.log(`User ${userId} logged out, data preserved`);
      }
    } catch (error) {
      console.error('Error during logout cleanup:', error);
    }
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    await this._storage?.clear();
  }

  // Add this method to app-storage.ts for better error handling
async moveFromWatchlistToWatched(movie: Movie): Promise<boolean> {
  try {
    // Check if movie is in watchlist first
    const isInList = await this.isInWatchlist(movie.id);
    if (!isInList) {
      console.error('Movie not found in watchlist');
      return false;
    }

    // Add to watched
    await this.addToWatched(movie);

    // Remove from watchlist
    await this.removeFromWatchlist(movie.id);

    console.log(`Movie "${movie.title}" moved successfully`);
    return true;
  } catch (error) {
    console.error('Error moving movie:', error);
    return false;
  }
}
}
