import { Component, OnInit } from '@angular/core';
import { AppStorage } from '../service/app-storage';
import { Movie } from '../service/movie-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  styleUrls: ['./watchlist.page.scss'],
  standalone: false,
})
export class WatchlistPage implements OnInit {
  watchlist: Movie[] = [];
  isLoading: boolean = false;

  constructor(
    private appStorage: AppStorage,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadWatchlist();
  }

  async ionViewWillEnter() {
    // Refresh watchlist every time the page is viewed
    await this.loadWatchlist();
  }

  async loadWatchlist() {
    this.isLoading = true;
    try {
      this.watchlist = await this.appStorage.getWatchlist();
      console.log('Watchlist loaded:', this.watchlist.length, 'items');
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      this.isLoading = false;
    }
  }

  viewMovieDetails(movie: Movie) {
    this.router.navigate(['/movie-details'], {
      state: { movie: movie }
    });
  }

  async removeFromWatchlist(movieId: string, event: Event) {
    event.stopPropagation(); // Prevent triggering the item click

    try {
      await this.appStorage.removeFromWatchlist(movieId);
      await this.loadWatchlist(); // Refresh the list

      // Optional: Show toast notification (add IonToast to template if needed)
      console.log('Movie removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }

  async clearAllWatchlist() {
    // Optional: Add confirmation alert
    const confirmed = confirm('Are you sure you want to clear your entire watchlist?');

    if (confirmed) {
      try {
        // Remove each movie individually
        for (const movie of this.watchlist) {
          await this.appStorage.removeFromWatchlist(movie.id);
        }
        await this.loadWatchlist(); // Refresh the list
        console.log('Watchlist cleared');
      } catch (error) {
        console.error('Error clearing watchlist:', error);
      }
    }
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  // Helper method to safely truncate description
  getShortDescription(description: string | undefined): string {
    if (!description) {
      return 'No description available';
    }

    const maxLength = 80;
    if (description.length <= maxLength) {
      return description;
    }

    return description.substring(0, maxLength) + '...';
  }
}
