import { StatisticsPage } from './../pages/statistics/statistics.page';
// src/app/search/search.page.ts
import { firstValueFrom } from 'rxjs';
import { MovieData } from './../service/movie-data';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication-service';
import { Movie } from 'src/app/models/movieModel';
import { ToastController } from '@ionic/angular';
import { AppStorage } from '../service/app-storage';

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
private toastController: ToastController,
private appStorage : AppStorage
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

  try {
    const response = await firstValueFrom(
      this.movieData.searchMovies(this.searchQuery, this.currentPage)
    );

    if (response.Response === 'True' && response.Search) {
      // Fetch full details for each movie to get genre and cast
      const moviesWithDetails = await Promise.all(
        response.Search.map(async (movie) => {
          try {
            const details = await firstValueFrom(
              this.movieData.getMovieDetails(movie.imdbID)
            );

            if (details && details.Response === 'True') {
              return {
                id: movie.imdbID,
                imdbID: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                image: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
                poster: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
                description: details.Plot || '',
                type: movie.Type,
                cast: details.Actors || 'Cast information not available',  // ✅ Now has cast
                genre: details.Genre || '',  // ✅ Now has genre
                rating: details.imdbRating,
                runtime: details.Runtime,
                director: details.Director
              };
            }
          } catch (error) {
            console.error(`Error fetching details for ${movie.Title}:`, error);
          }

          // Fallback if details fetch fails
          return {
            id: movie.imdbID,
            imdbID: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            image: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
            poster: movie.Poster !== 'N/A' ? movie.Poster : 'assets/default-poster.jpg',
            description: '',
            type: movie.Type,
            cast: '',
            genre: ''
          };
        })
      );

      if (append) {
        this.searchResults = [...this.searchResults, ...moviesWithDetails];
      } else {
        this.searchResults = moviesWithDetails;
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
// await this.showToast(this.errorMessage, 'danger');
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

goToStats(){
this.router.navigate(['/statistics'])
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

// Add these methods to your SearchPage class

// In search.page.ts - add this method
truncateTextShort(text: string): string {
if (!text) return 'No cast information';
const maxLength = 60;
if (text.length <= maxLength) return text;
return text.substring(0, maxLength) + '...';
}

// Or modify existing method to have a default parameter
// In search.page.ts
truncateText(text: string | string[] | undefined, maxLength: number = 60): string {
if (!text) return '';

// Convert array to string if needed
let stringText: string;
if (Array.isArray(text)) {
stringText = text.join(', ');
} else {
stringText = text;
}

if (stringText.length <= maxLength) return stringText;
return stringText.substring(0, maxLength) + '...';
}

// In search.page.ts
getCastString(cast: string | string[] | undefined): string {
if (!cast) return 'Cast information not available';

if (Array.isArray(cast)) {
return cast.join(', ');
}

return cast;
}

// For truncating
getTruncatedCast(cast: string | string[] | undefined, maxLength: number = 60): string {
const castString = this.getCastString(cast);
if (castString.length <= maxLength) return castString;
return castString.substring(0, maxLength) + '...';
}

async addToWatchlist(movie: Movie) {
  this.isLoading = true;

  try {
    // Fetch full movie details including cast and genre
    const details = await firstValueFrom(
      this.movieData.getMovieDetails(movie.imdbID)
    );

    if (details && details.Response === 'True') {
      // Create full movie object with all details
      const fullMovie: Movie = {
        id: movie.imdbID,
        imdbID: movie.imdbID,
        title: details.Title || movie.title,
        year: details.Year || movie.year,
        image: details.Poster !== 'N/A' ? details.Poster : 'assets/default-poster.jpg',
        poster: details.Poster !== 'N/A' ? details.Poster : 'assets/default-poster.jpg',
        description: details.Plot || '',
        cast: details.Actors || '',  // Now has cast!
        genre: details.Genre || '',  // Now has genre!
        rating: details.imdbRating,   // Now has rating!
        runtime: details.Runtime,     // Now has runtime!
        director: details.Director    // Now has director!
      };

      await this.appStorage.addToWatchlist(fullMovie);
      await this.showToast('Added to watchlist', 'success');
    } else {
      await this.showToast('Failed to fetch movie details', 'danger');
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    await this.showToast('Error adding to watchlist', 'danger');
  } finally {
    this.isLoading = false;
  }
}

// Add to search.page.ts
onSearchInput() {
if (this.searchQuery.trim()) {
// Optional: Auto-search after typing stops
if (this.searchTimeout) {
clearTimeout(this.searchTimeout);
}
this.searchTimeout = setTimeout(() => {
this.onSearch();
}, 800);
}
}

private searchTimeout: any;

}
