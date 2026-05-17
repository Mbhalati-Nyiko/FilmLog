import { Component, OnInit } from '@angular/core';
import { AppStorage } from '../service/app-storage';
import { AuthenticationService } from '../service/authentication-service';
import { Movie } from 'src/app/models/movieModel';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

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
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

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
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        { text: 'Yes, Mark as Watched', handler: async () => await this.performMoveToWatched(movie) }
      ]
    });
    await alert.present();
  }

  async performMoveToWatched(movie: Movie) {
    this.isLoading = true;
    try {
      await this.appStorage.addToWatched(movie);
      if (movie.watchlistItemId) {
        await this.appStorage.removeFromWatchlist(movie.watchlistItemId);
      }
      await this.loadWatchlist();
      this.showToast(`"${movie.title}" moved to watched list`, 'success');
    } catch (error) {
      console.error('Error moving to watched:', error);
      this.showToast('Failed to move movie', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async loadWatchlist() {
    if (!this.isLoggedIn) return;
    this.isLoading = true;
    try {
      this.watchlist = await this.appStorage.getWatchlist();
      console.log('Watchlist loaded:', this.watchlist.length, 'items');
    } catch (error) {
      console.error('Error loading watchlist:', error);
      this.showToast('Failed to load watchlist', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  viewMovieDetails(movie: Movie) {
    this.router.navigate(['/movie-details'], { state: { movie: movie } });
  }

  async removeFromWatchlist(movie: Movie, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Remove Movie',
      message: `Remove "${movie.title}" from your watchlist?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', handler: async () => {
            if (movie.watchlistItemId) {
              await this.appStorage.removeFromWatchlist(movie.watchlistItemId);
              await this.loadWatchlist();
              this.showToast('Movie removed from watchlist', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async clearAllWatchlist() {
    const alert = await this.alertController.create({
      header: 'Clear Watchlist',
      message: 'Are you sure you want to clear your entire watchlist?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Clear All', handler: async () => {
            this.isLoading = true;
            try {
              for (const movie of this.watchlist) {
                if (movie.watchlistItemId) {
                  await this.appStorage.removeFromWatchlist(movie.watchlistItemId);
                }
              }
              await this.loadWatchlist();
              this.showToast('Watchlist cleared', 'success');
            } catch (error) {
              console.error('Error clearing watchlist:', error);
              this.showToast('Failed to clear watchlist', 'danger');
            } finally {
              this.isLoading = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getShortDescription(cast: string | string[] | undefined): string {
    if (!cast) return 'No cast information available';
    let castString = Array.isArray(cast) ? cast.join(', ') : cast;
    const maxLength = 80;
    return castString.length <= maxLength ? castString : castString.substring(0, maxLength) + '...';
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
