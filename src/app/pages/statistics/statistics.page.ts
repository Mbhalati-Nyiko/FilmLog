// statistics.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/service/authentication-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: false,
})
export class StatisticsPage implements OnInit {
  stats: any = null;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(
        this.http.get('http://localhost:5000/api/statistics/dashboard', {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` }
        })
      );
      this.stats = response;
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
