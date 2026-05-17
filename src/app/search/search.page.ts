// src/app/search/search.page.ts
import { firstValueFrom } from 'rxjs';
import { MovieData } from './../service/movie-data';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication-service';
import { Movie } from 'src/app/models/movieModel';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit {
  searchQuery: string = '';
  searchResults: Movie[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 1;
  totalResults: number = 0;
  hasMoreResults: boolean = false;

  constructor(
    private movieData: MovieData,
    private router: Router,
    private authService: AuthenticationService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.checkAuth();
  }

  ionViewWillEnter() {
    this.checkAuth();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  async onSearch() {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term';
      this.searchResults = [];
      return;
    }

    this.currentPage = 1;
    await this.fetchSearchResults();
  }

  async loadMoreResults(event?: any) {
    if (!this.hasMoreResults) {
      if (event) event.target.disabled = true;
      return;
    }

    this.currentPage++;
    await this.fetchSearchResults(true, event);
  }

  async fetchSearchResults(append: boolean = false, event?: any) {
    this.isLoading = true;
    this.errorMessage = '';

    if (!append) {
      this.searchResults = [];
    }

    try {
      const response = await firstValueFrom(
        this.movieData.searchMovies(this.searchQuery, this.currentPage)
      );

      if (response.Response === 'True' && response.Search) {
        const newResults = response.Search.map(movie => ({
          id: movie.imdbID,
          imdbID: movie.imdbID,
          title: movie.Title,
          year: movie.Year,
          image: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
          poster: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
          description: `${movie.Title} (${movie.Year})`,
          cast: '',
          genre: ''
        }));

        if (append) {
          this.searchResults = [...this.searchResults, ...newResults];
        } else {
          this.searchResults = newResults;
        }

        this.totalResults = parseInt(response.totalResults || '0');
        this.hasMoreResults = this.searchResults.length < this.totalResults;

        console.log(`Loaded ${this.searchResults.length} of ${this.totalResults} results`);
      } else if (response.Response === 'False') {
        this.errorMessage = response.Error || 'No movies found';
        if (!append) this.searchResults = [];
      } else {
        this.errorMessage = 'No movies found. Try a different search term.';
        if (!append) this.searchResults = [];
      }
    } catch (error: any) {
      console.error('Search error:', error);
      this.errorMessage = error.message || 'An error occurred while searching.';
      await this.showToast(this.errorMessage, 'danger');
      if (!append) this.searchResults = [];
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.errorMessage = '';
    this.currentPage = 1;
    this.hasMoreResults = false;
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

  goToSearch() {
    this.router.navigate(['/search']);
  }

  goToWatchlist() {
    this.router.navigate(['/watchlist']);
  }

  goToWatched() {
    this.router.navigate(['/watched']);
  }

  logOut() {
    this.clearSearch();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
