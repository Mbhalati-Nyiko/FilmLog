import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonButtons, IonBackButton,
  IonChip, IonLabel, IonToast, IonImg
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookmarkOutline,
  bookmark,
  checkmarkCircleOutline,
  checkmarkCircle,
  starOutline,
  star,
  timeOutline,
  calendarOutline,
  peopleOutline
} from 'ionicons/icons';
import { AppStorage } from 'src/app/service/app-storage';

export interface Movie {
  id: string;
  title: string;
  year: string;
  image: string;
  description: string;
  rating?: string;
  runtime?: string;
  genre?: string[];
  director?: string;
  cast?: string[];
}

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
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appStorage: AppStorage
  ) {
    addIcons({
      bookmarkOutline,
      bookmark,
      checkmarkCircleOutline,
      checkmarkCircle,
      starOutline,
      star,
      timeOutline,
      calendarOutline,
      peopleOutline
    });
  }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { movie: Movie };

    if (state?.movie) {
      this.movie = state.movie;
      console.log('Movie loaded:', this.movie);
    } else {
      const movieId = this.route.snapshot.paramMap.get('id');
      if (movieId) {
        await this.loadMovieDetails(movieId);
      }
    }

    if (this.movie) {
      await this.checkUserStatus();
    }
  }

  async loadMovieDetails(movieId: string) {
    this.movie = {
      id: movieId,
      title: 'Movie Details',
      year: 'N/A',
      image: 'https://via.placeholder.com/400x600',
      description: 'Loading movie details...',
      rating: 'N/A',
      runtime: 'N/A',
      genre: [],
      director: 'Unknown',
      cast: []
    };
  }

  // Safe description getter with fallback
  getSafeDescription(description: string | undefined): string {
    if (!description) {
      return 'No synopsis available for this movie.';
    }

    if (typeof description !== 'string') {
      return 'No synopsis available for this movie.';
    }

    const trimmed = description.trim();
    return trimmed || 'No synopsis available for this movie.';
  }

  async checkUserStatus() {
    if (!this.movie) return;

    try {
      this.isWatched = await this.appStorage.isMovieWatched(this.movie.id);
      this.isInWatchlist = await this.appStorage.isInWatchlist(this.movie.id);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }

  async toggleWatched() {
    if (!this.movie) return;

    try {
      if (this.isWatched) {
        await this.appStorage.removeFromWatched(this.movie.id);
        this.isWatched = false;
        this.showToastMessage('Removed from watched', 'secondary');
      } else {
        await this.appStorage.addToWatched(this.movie);
        this.isWatched = true;
        this.showToastMessage('Marked as watched!', 'success');
      }
    } catch (error) {
      console.error('Error toggling watched:', error);
      this.showToastMessage('An error occurred', 'danger');
    }
  }

  async toggleWatchlist() {
    if (!this.movie) return;

    try {
      if (this.isInWatchlist) {
        await this.appStorage.removeFromWatchlist(this.movie.id);
        this.isInWatchlist = false;
        this.showToastMessage('Removed from watchlist', 'secondary');
      } else {
        await this.appStorage.addToWatchlist(this.movie);
        this.isInWatchlist = true;
        this.showToastMessage('Added to watchlist!', 'success');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      this.showToastMessage('An error occurred', 'danger');
    }
  }

  showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }
}
