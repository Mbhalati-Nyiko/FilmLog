import { AppStorage } from 'src/app/service/app-storage';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication-service';
import { Movie, MovieData } from '../service/movie-data';

@Component({
  selector: 'app-watched',
  templateUrl: 'watched.page.html',
  styleUrls: ['watched.page.scss'],
  standalone: false,
})
export class WatchedPage implements OnInit {

  watched: Movie[] = [];
  isLoading : boolean = false;
  isLoggedIn : boolean = false;

  constructor(
    private router: Router,
    private authService : AuthenticationService,
    private movieData : MovieData,
    private appStorage : AppStorage
  ) {}

  async ngOnInit() {
    this.checkAuth;
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (!this.isLoggedIn) {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
    }
  }

  async ionViewWillEnter() {
    this.checkAuth();
    if (this.isLoggedIn) {
      await this.loadWatched();
    }
  }

  async loadWatched() {
    if (!this.isLoggedIn) return;

    this.isLoading = true;
    try {
      this.watched = await this.appStorage.getWatchedMovies();
      console.log('Watched loaded for user:', this.authService.getCurrentUser()?.username, this.watched.length, 'items');
    } catch (error) {
      console.error('Error loading watched:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async removeFromWatched(movieId: string) {
    // event.stopPropagation();

    try {
      await this.appStorage.removeFromWatched(movieId);
      await this.loadWatched();
      this.router.navigate(['/watched']);
      console.log('Movie removed from watched');
    } catch (error) {
      console.error('Error removing from watched:', error);
    }
  }

  async clearAllWatched() {
    const confirmed = confirm('Are you sure you want to clear all your watched movies?');

    if (confirmed) {
      try {
        for (const movie of this.watched) {
          await this.appStorage.removeFromWatched(movie.id);
        }
        await this.loadWatched();
        console.log('Watched cleared');
      } catch (error) {
        console.error('Error clearing watched:', error);
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

  viewMovieDetails(movie: Movie) {
      this.router.navigate(['/movie-details'], {
        state: { movie: movie }
      });
    }

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

}
