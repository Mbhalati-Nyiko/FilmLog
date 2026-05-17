import { Component, OnInit } from '@angular/core';
import { AppStorage } from '../service/app-storage';
import { AuthenticationService } from '../service/authentication-service';
import { Movie } from 'src/app/models/movieModel';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-watched',
  templateUrl: 'watched.page.html',
  styleUrls: ['watched.page.scss'],
  standalone: false,
})
export class WatchedPage implements OnInit {
  watched: Movie[] = [];
  isLoading: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private appStorage: AppStorage,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (!this.isLoggedIn) {
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
      console.log('Watched loaded:', this.watched.length, 'items');
    } catch (error) {
      console.error('Error loading watched:', error);
      this.showToast('Failed to load watched movies', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async removeFromWatched(movie: Movie, event?: Event) {
    if (event) event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Remove Movie',
      message: `Remove "${movie.title}" from your watched list?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', handler: async () => {
            if (movie.watchedItemId) {
              await this.appStorage.removeFromWatched(movie.watchedItemId);
              await this.loadWatched();
              this.showToast('Movie removed from watched', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async clearAllWatched() {
    const alert = await this.alertController.create({
      header: 'Clear Watched',
      message: 'Are you sure you want to clear all your watched movies?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Clear All', handler: async () => {
            this.isLoading = true;
            try {
              for (const movie of this.watched) {
                if (movie.watchedItemId) {
                  await this.appStorage.removeFromWatched(movie.watchedItemId);
                }
              }
              await this.loadWatched();
              this.showToast('Watched history cleared', 'success');
            } catch (error) {
              console.error('Error clearing watched:', error);
              this.showToast('Failed to clear watched history', 'danger');
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

  viewMovieDetails(movie: Movie) {
    this.router.navigate(['/movie-details'], { state: { movie: movie } });
  }

  goToSearch() { this.router.navigate(['/search']); }
  goToWatchlist() { this.router.navigate(['/watchlist']); }
  goToWatched() { this.router.navigate(['/watched']); }
  logOut() { this.authService.logout(); this.router.navigate(['/login']); }

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
