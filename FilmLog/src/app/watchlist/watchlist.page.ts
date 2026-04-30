import { Component, OnInit } from '@angular/core';
import { AppStorage } from '../service/app-storage';
import { AuthenticationService } from '../service/authentication-service';
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
  isLoggedIn: boolean = false;

  constructor(
    private appStorage: AppStorage,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  goToSearch(){
    this.router.navigate(['/search']);
    return;
  }

  goToWatchlist(){
    this.router.navigate(['/watchlist']);
    return;
  }

  goToWatched(){
    this.router.navigate(['/watched']);
    return;
  }

  logOut(){
    this.authService.logout();
    this.router.navigate(['/login']);
}

  async ngOnInit() {
    this.checkAuth();
  }

  async ionViewWillEnter() {
    this.checkAuth();
    if (this.isLoggedIn) {
      await this.loadWatchlist();
    }
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (!this.isLoggedIn) {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
    }
  }

  async loadWatchlist() {
    if (!this.isLoggedIn) return;

    this.isLoading = true;
    try {
      this.watchlist = await this.appStorage.getWatchlist();
      console.log('Watchlist loaded for user:', this.authService.getCurrentUser()?.username, this.watchlist.length, 'items');
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
    event.stopPropagation();

    try {
      await this.appStorage.removeFromWatchlist(movieId);
      await this.loadWatchlist();
      console.log('Movie removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }

  async clearAllWatchlist() {
    const confirmed = confirm('Are you sure you want to clear your entire watchlist?');

    if (confirmed) {
      try {
        for (const movie of this.watchlist) {
          await this.appStorage.removeFromWatchlist(movie.id);
        }
        await this.loadWatchlist();
        console.log('Watchlist cleared');
      } catch (error) {
        console.error('Error clearing watchlist:', error);
      }
    }
  }


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
