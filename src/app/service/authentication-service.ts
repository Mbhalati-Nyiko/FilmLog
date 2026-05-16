import { User } from './../models/userModel';
// authentication-service.ts
import { Injectable } from '@angular/core';
import { LogInModel, SignUpModel } from '../pages/login/login.page';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userKey: string = 'users';
  private currentUserKey: string = 'logged-in-user';

  constructor() {}

  // Register new user
  onRegister(signUpObj: SignUpModel): boolean {
    // Validate input
    if (!signUpObj.username || !signUpObj.password || !signUpObj.email) {
      console.error('All fields are required');
      return false;
    }

    const localUser = localStorage.getItem(this.userKey);
    let users = [];

    if (localUser !== null) {
      users = JSON.parse(localUser);

      // Check if user already exists
      const userExists = users.some((user: SignUpModel) =>
        user.username === signUpObj.username || user.email === signUpObj.email
      );

      if (userExists) {
        console.error('User already exists');
        return false;
      }
    }

    // Create new user (don't store sensitive data in plain text in production)
    const newUser = {
      username: signUpObj.username,
      email: signUpObj.email,
      password: signUpObj.password // In production, hash this!
    };

    users.push(newUser);
    localStorage.setItem(this.userKey, JSON.stringify(users));
    console.log('User registered successfully');
    return true;
  }

  // Login user
  login(logInObj: LogInModel): boolean {
    if (!logInObj.username || !logInObj.password) {
      console.error('Username and password required');
      return false;
    }

    const localUser = localStorage.getItem(this.userKey);

    if (localUser === null) {
      console.error('No users found');
      return false;
    }

    const users = JSON.parse(localUser);
    const user = users.find((u: any) =>
      u.username === logInObj.username && u.password === logInObj.password
    );

    if (user) {
      // Store only necessary user info, exclude password
      const { password, ...safeUser } = user;
      localStorage.setItem(this.currentUserKey, JSON.stringify(safeUser));
      console.log('Login successful');
      return true;
    }

    console.error('Invalid credentials');
    return false;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.currentUserKey);
  }

  // Get current user info
  getCurrentUser(): any {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    console.log('Logged out successfully');
  }

  // Get all users (for debugging only, remove in production)
  getAllUsers(): any[] {
    const users = localStorage.getItem(this.userKey);
    return users ? JSON.parse(users) : [];
  }
}
