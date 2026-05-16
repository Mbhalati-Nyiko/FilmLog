import { Component, OnInit } from '@angular/core';
import { AppStorage } from '../service/app-storage';
import { AuthenticationService } from '../service/authentication-service';
import { Movie } from '../pages/movie-details/movie-details.page';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MovieDetailsPage } from '../pages/movie-details/movie-details.page';

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
    private router: Router,
    private alertController : AlertController,
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

  async refreshWatchlist() {
    await this.loadWatchlist();
  }

  async moveToWatched(movie: Movie) {
    const alert = await this.alertController.create({
      header: 'Move to Watched',
      message: `Mark "${movie.title}" as watched? This will remove it from your watchlist.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Yes, Mark as Watched',
          handler: async () => {
            await this.performMoveToWatched(movie);
          }
        }
      ]
    });

    await alert.present();
  }

   async performMoveToWatched(movie: Movie) {
    this.isLoading = true;


    try {
      // Add to watched list
      await this.appStorage.addToWatched(movie);

      // Remove from watchlist
      await this.appStorage.removeFromWatchlist(movie.id);

      // Reload watchlist
      await this.loadWatchlist();

      // Show success message
      const successAlert = await this.alertController.create({
        header: 'Success!',
        message: `"${movie.title}" has been moved to your watched list.`,
        buttons: ['OK'],
        cssClass: 'success-alert'
      });

      await successAlert.present();

      console.log(`Movie "${movie.title}" moved to watched`);
    } catch (error) {
      console.error('Error moving to watched:', error);
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to move movie. Please try again.',
        buttons: ['OK']
      });
      await errorAlert.present();
    } finally {
      this.isLoading = false;
    }
  }

  async performRemoveFromWatchlist(movieId: string) {
    this.isLoading = true;
    try {
      await this.appStorage.removeFromWatchlist(movieId);
      await this.loadWatchlist();

      const toast = document.createElement('ion-toast');
      toast.message = 'Movie removed from watchlist';
      toast.duration = 2000;
      document.body.appendChild(toast);
      toast.present();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    } finally {
      this.isLoading = false;
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
