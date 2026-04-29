// login.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput, IonToggle } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication-service';
import { Router } from '@angular/router'; // Add this for navigation

@Component({
  selector: 'app-login',
  imports: [IonInput, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  signUpObj: SignUpModel = new SignUpModel();
  logInObj: LogInModel = new LogInModel();
  isSignUpMode: boolean = false;
  myImagePath = "assets/logo/FilmLog-Logo.jpg";

  @ViewChild('toggle') toggleRef!: ElementRef<IonToggle>;
  @ViewChild('loginContainer') loginContainerRef!: ElementRef;

  constructor(
    private authService: AuthenticationService,
    private router: Router // Add Router for navigation
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Optional: Animation or initialization logic here
  }

  onRegister() {
    const success = this.authService.onRegister(this.signUpObj);

    if (success) {
      console.log('Registration successful');
      // Clear form after successful registration
      this.signUpObj = new SignUpModel();
      // Optionally switch to login mode
      this.isSignUpMode = false;
      // Show success message (consider adding a toast notification)
    } else {
      // Handle registration error
      console.error('Registration failed');
      console.log('All usernames and emails:', this.authService.getAllUsers());
      //Remove all users from local storage for testing purposes
      localStorage.removeItem('users');
      // Show error message (consider adding a toast notification)
    }
  }

  onLogin() {
    const success = this.authService.login(this.logInObj);

    if (success) {
      console.log('Login successful');
      // Navigate to home/dashboard page
      this.router.navigate(['/search']); // Adjust route as needed
      // Clear sensitive data from memory
      this.logInObj.password = '';
    } else {
      console.error('Login failed');
      // Handle login error - show user feedback
    }
  }

  toggleForm() {
    this.isSignUpMode = !this.isSignUpMode;
    // Clear forms when toggling
    if (this.isSignUpMode) {
      this.logInObj = new LogInModel();
    } else {
      this.signUpObj = new SignUpModel();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

export class SignUpModel {
  username: string = '';
  password: string = '';
  email: string = '';

  constructor() {
    this.username = "";
    this.password = "";
    this.email = "";
  }
}

export class LogInModel {
  username: string = '';
  password: string = '';

  constructor() {
    this.username = "";
    this.password = "";
  }
}
