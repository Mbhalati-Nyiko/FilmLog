import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from 'src/app/service/app-storage';
import { AuthenticationService } from 'src/app/service/authentication-service';
import { MovieData } from 'src/app/service/movie-data';
import { Movie } from 'src/app/models/movieModel';
import { ToastController } from '@ionic/angular';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: false,
})
export class MovieDetailsPage implements OnInit, OnDestroy {
  movie: Movie | null = null;
  isWatched: boolean = false;
  isInWatchlist: boolean = false;
  isLoggedIn: boolean = false;
  isLoading: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appStorage: AppStorage,
    private authService: AuthenticationService,
    private toastController: ToastController,
    private movieData: MovieData
  ) {}

  async ngOnInit() {
    // Subscribe to auth status changes
    this.authSubscription = this.authService.getAuthStatus().subscribe(async (isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;

      if (!isAuthenticated) {
        // User logged out, clear all data
        this.clearMovieData();
      } else if (isAuthenticated && !this.movie) {
        // User logged back in, try to reload if we had a movie before
        await this.loadMovieFromState();
      }
    });

    await this.checkAuthAndLoad();
  }

  async ionViewWillEnter() {
    // Check auth every time page becomes visible
    await this.checkAuthAndLoad();
  }

  async checkAuthAndLoad() {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (!this.isLoggedIn) {
      this.clearMovieData();
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    // Only load movie if we don't have one
    if (!this.movie) {
      await this.loadMovieFromState();
    }
  }

  clearMovieData() {
    this.movie = null;
    this.isWatched = false;
    this.isInWatchlist = false;
    this.isLoading = false;
  }

  async loadMovieFromState() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { movie: Movie };

    if (state?.movie) {
      this.movie = state.movie;
      if (this.movie && (!this.movie.genre || !this.movie.cast || !this.movie.rating)) {
        await this.fetchFullMovieDetails();
      }
      await this.checkUserStatus();
    } else {
      const movieId = this.route.snapshot.paramMap.get('id');
      if (movieId) {
        await this.loadMovieDetails(movieId);
      } else {
        // No movie data, go back to search
        this.router.navigate(['/search']);
      }
    }
  }

  async fetchFullMovieDetails() {
    if (!this.movie?.imdbID) return;

    try {
      this.isLoading = true;
      const details = await firstValueFrom(
        this.movieData.getMovieDetails(this.movie.imdbID)
      );

      if (details && details.Response === 'True') {
        // Update movie with full details from OMDb
        this.movie = {
          ...this.movie,
          description: details.Plot || this.movie?.description,
          cast: details.Actors || this.movie?.cast,
          genre: details.Genre || this.movie?.genre,
          rating: details.imdbRating || this.movie?.rating,
          runtime: details.Runtime || this.movie?.runtime,
          director: details.Director || this.movie?.director,
          year: details.Year || this.movie?.year,
          image: details.Poster !== 'N/A' ? details.Poster : this.movie?.image,
          poster: details.Poster !== 'N/A' ? details.Poster : this.movie?.poster
        };

        console.log('Full movie details loaded:', {
          genre: this.movie.genre,
          cast: this.movie.cast,
          rating: this.movie.rating
        });
      }
    } catch (error) {
      console.error('Error fetching full movie details:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMovieDetails(movieId: string) {
    try {
      this.isLoading = true;
      const details = await firstValueFrom(
        this.movieData.getMovieDetails(movieId)
      );

      if (details && details.Response === 'True') {
        this.movie = {
          id: details.imdbID,
          imdbID: details.imdbID,
          title: details.Title,
          year: details.Year,
          description: details.Plot,
          cast: details.Actors,
          genre: details.Genre,
          rating: details.imdbRating,
          runtime: details.Runtime,
          director: details.Director,
          image: details.Poster !== 'N/A' ? details.Poster : 'assets/default-poster.jpg',
          poster: details.Poster !== 'N/A' ? details.Poster : 'assets/default-poster.jpg'
        };
        await this.checkUserStatus();
      }
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      this.isLoading = false;
    }
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

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      if (this.isWatched) {
        const watchedMovies = await this.appStorage.getWatchedMovies();
        const watchedMovie = watchedMovies.find(m => m.imdbID === this.movie?.imdbID);
        if (watchedMovie?.watchedItemId) {
          await this.appStorage.removeFromWatched(watchedMovie.watchedItemId);
        }
        this.isWatched = false;
        this.showToast('Removed from watched', 'secondary');
      } else {
        if (!this.movie.genre || !this.movie.cast) {
          await this.fetchFullMovieDetails();
        }
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

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

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
        if (!this.movie.genre || !this.movie.cast) {
          await this.fetchFullMovieDetails();
        }
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

  getCastArray(cast: string | string[] | undefined): string[] {
    if (!cast) return [];
    if (Array.isArray(cast)) return cast;
    return cast.split(',').map(actor => actor.trim());
  }

  getSafeDescription(description: string | undefined): string {
    if (!description) return 'No synopsis available for this movie.';
    const trimmed = description.trim();
    return trimmed || 'No synopsis available for this movie.';
  }

  goToSearch() { this.router.navigate(['/search']); }
  goToWatchlist() { this.router.navigate(['/watchlist']); }
  goToWatched() { this.router.navigate(['/watched']); }
  goToStats() { this.router.navigate(['/statistics']); }

  logOut() {
    this.authService.logout();
    // The auth subscription will handle clearing data
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
