import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/service/authentication-service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: false,
})
export class StatisticsPage implements OnInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;

  stats: any = null;
  isLoading = false;

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  mostRewatchedData: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async ionViewWillEnter() {
    await this.loadStats();
  }

  async loadStats() {
    this.isLoading = true;
    try {
      // Fixed API URL - use correct port 5165
      const response = await firstValueFrom(
        this.http.get('http://localhost:5166/api/stats/dashboard', {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` }
        })
      );
      this.stats = response;
      this.prepareRewatchedTable();

      // Wait for DOM to render then create charts
      setTimeout(() => {
        this.createPieChart();
        this.createBarChart();
      }, 200);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.isLoading = false;
    }
  }

  createPieChart() {
    if (!this.pieChartRef || !this.stats?.topGenres?.length) {
      console.log('No pie chart data available');
      return;
    }

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const labels = this.stats.topGenres.map((g: any) => g.genre);
    const data = this.stats.topGenres.map((g: any) => g.count);

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          borderWidth: 2,
          borderColor: '#1c1c1e'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: 'white', font: { size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} movies (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createBarChart() {
    if (!this.barChartRef || !this.stats?.topRatedMovies?.length) {
      console.log('No bar chart data available');
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    const labels = this.stats.topRatedMovies.map((m: any) =>
      m.title.length > 15 ? m.title.substring(0, 12) + '...' : m.title
    );
    const ratings = this.stats.topRatedMovies.map((m: any) => m.rating);

    const ctx = this.barChartRef.nativeElement.getContext('2d');
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'IMDb Rating',
          data: ratings,
          backgroundColor: '#8371fd',
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Rating (out of 10)',
              color: '#8e8e93'
            },
            grid: { color: '#2c2c2e' },
            ticks: { color: 'white' }
          },
          x: {
            ticks: {
              color: 'white',
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 6,
              font: { size: 10 }
            },
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            labels: { color: 'white' }
          },
          tooltip: {
            callbacks: {
              label: (context) => `Rating: ${context.raw}/10`
            }
          }
        }
      }
    });
  }

  prepareRewatchedTable() {
    if (this.stats?.mostRewatched?.length) {
      this.mostRewatchedData = this.stats.mostRewatched.map((m: any) => ({
        title: m.title,
        year: m.year,
        timesWatched: m.timesWatched,
        lastWatched: m.lastWatched,
        genre: m.genre || 'N/A',
        imdbID: m.imdbID,
        poster: m.poster
      }));
    }
  }

  viewMovieDetails(movie: any) {
    this.router.navigate(['/movie-details'], {
      state: { movie: {
        imdbID: movie.imdbID,
        title: movie.title,
        year: movie.year,
        poster: movie.poster
      } }
    });
  }

  goToSearch() { this.router.navigate(['/search']); }
  goToWatchlist() { this.router.navigate(['/watchlist']); }
  goToWatched() { this.router.navigate(['/watched']); }
  goToStats() { this.router.navigate(['/statistics']); }
  logOut() { this.authService.logout(); this.router.navigate(['/login']); }
}
