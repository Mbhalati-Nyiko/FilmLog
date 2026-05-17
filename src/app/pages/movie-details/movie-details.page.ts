// src/app/pages/movie-details/movie-details.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from 'src/app/service/app-storage';
import { AuthenticationService } from 'src/app/service/authentication-service';
import { Movie } from 'src/app/models/movieModel';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: false,
})
export class MovieDetailsPage implements OnInit {
  movie: Movie | null = null;
  isWatched: boolean = false;
  isInWatchlist: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appStorage: AppStorage,
    private authService: AuthenticationService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { movie: Movie };

    if (state?.movie) {
      this.movie = state.movie;
      await this.checkUserStatus();
    } else {
      const movieId = this.route.snapshot.paramMap.get('id');
      if (movieId) {
        await this.loadMovieDetails(movieId);
      }
    }
  }

  async loadMovieDetails(movieId: string) {
    // Fetch from OMDb via your backend
    // This would call your MoviesController
  }

  getSafeDescription(description: string | undefined): string {
    if (!description) return 'No synopsis available for this movie.';
    const trimmed = description.trim();
    return trimmed || 'No synopsis available for this movie.';
  }

  async checkUserStatus() {
    if (!this.movie?.imdbID) return;
    try {
      this.isWatched = await this.appStorage.isMovieWatched(this.movie.imdbID);
      this.isInWatchlist = await this.appStorage.isInWatchlist(this.movie.imdbID);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }

  async toggleWatched() {
    if (!this.movie) return;
    try {
      if (this.isWatched) {
        // Need to get the database ID first
        const watchedMovies = await this.appStorage.getWatchedMovies();
        const watchedMovie = watchedMovies.find(m => m.imdbID === this.movie?.imdbID);
        if (watchedMovie?.watchedItemId) {
          await this.appStorage.removeFromWatched(watchedMovie.watchedItemId);
        }
        this.isWatched = false;
        this.showToast('Removed from watched', 'secondary');
      } else {
        await this.appStorage.addToWatched(this.movie);
        this.isWatched = true;
        this.showToast('Marked as watched!', 'success');
      }
    } catch (error) {
      console.error('Error toggling watched:', error);
      this.showToast('An error occurred', 'danger');
    }
  }

  async toggleWatchlist() {
    if (!this.movie) return;
    try {
      if (this.isInWatchlist) {
        const watchlist = await this.appStorage.getWatchlist();
        const watchlistMovie = watchlist.find(m => m.imdbID === this.movie?.imdbID);
        if (watchlistMovie?.watchlistItemId) {
          await this.appStorage.removeFromWatchlist(watchlistMovie.watchlistItemId);
        }
        this.isInWatchlist = false;
        this.showToast('Removed from watchlist', 'secondary');
      } else {
        await this.appStorage.addToWatchlist(this.movie);
        this.isInWatchlist = true;
        this.showToast('Added to watchlist!', 'success');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      this.showToast('An error occurred', 'danger');
    }
  }

  async showToast(message: string, color: string = 'success') {

    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  goToSearch() { this.router.navigate(['/search']); }
  goToWatchlist() { this.router.navigate(['/watchlist']); }
  goToWatched() { this.router.navigate(['/watched']); }
  logOut() { this.authService.logout(); this.router.navigate(['/login']); }
}
