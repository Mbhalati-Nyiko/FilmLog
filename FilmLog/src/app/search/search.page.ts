import { MovieData, Movie } from './../service/movie-data';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: false,
})
export class SearchPage {
  searchQuery: string = '';
  searchResults: Movie[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private movieData: MovieData,
    private router: Router
  ) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term';
      this.searchResults = [];
      return;
    }

    console.log('Search query:', this.searchQuery);
    this.fetchSearchResults();
  }

  fetchSearchResults() {
    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];

    this.movieData.getMovies(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;

        if (results.length === 0) {
          this.errorMessage = 'No movies found. Try a different search term.';
        }
      },
      error: (error) => {
        console.error('Search error:', error);
        this.errorMessage = error.message || 'An error occurred while searching. Please try again.';
        this.isLoading = false;
        this.searchResults = [];
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.errorMessage = '';
  }

  // Safe helper method to get truncated description
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
}
