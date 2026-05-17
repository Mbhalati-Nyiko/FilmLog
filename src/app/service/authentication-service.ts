// authentication-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;  // Changed from 'name' to match backend
  password: string;
}

export interface RegisterRequest {
  username: string;  // Changed from 'name' to match backend
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;  // Changed from 'name' to match backend
}

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:5165/api';
  private tokenKey = 'jwt_token';
  private userKey = 'user_info';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = localStorage.getItem(this.tokenKey);
    if (token && this.isTokenValid(token)) {
      this.isAuthenticatedSubject.next(true);
    } else if (token) {
      this.logout(); // Clear invalid token
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  onRegister(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('Registration error:', error);
          const errorMessage = error.error?.title || error.error || 'Registration failed';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('Login error:', error);
          const errorMessage = error.error?.title || error.error || 'Invalid username or password';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  private storeAuthData(authResponse: AuthResponse) {
    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem(this.userKey, JSON.stringify({
      id: authResponse.userId,
      username: authResponse.username
    }));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getUserId(): number | null {
    return this.getCurrentUser()?.id || null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
}
