// login.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput, IonToggle } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [IonInput, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  signUpObj: SignUpModel = new SignUpModel();
  logInObj: LogInModel = new LogInModel();
  isSignUpMode: boolean = false;
  myImagePath = "assets/logo/FilmLog-Logo.jpg";
  isLoading = false;
  errorMessage = '';

  @ViewChild('toggle') toggleRef!: ElementRef<IonToggle>;
  @ViewChild('loginContainer') loginContainerRef!: ElementRef;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/search']);
    }
  }

  ngAfterViewInit() {
    // Optional: Animation or initialization logic here
  }

  onRegister() {
    this.isLoading = true;
    this.errorMessage = '';

    const success = this.authService.onRegister(this.signUpObj);

    if (success) {
      console.log('Registration successful');
      // Clear form after successful registration
      this.signUpObj = new SignUpModel();
      // Switch to login mode
      this.isSignUpMode = false;
      // Show success message
      alert('Registration successful! Please login.');
    } else {
      this.errorMessage = 'Registration failed. User may already exist.';
      console.error('Registration failed');
    }

    this.isLoading = false;
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const success = this.authService.login(this.logInObj);
      if (success) {
        console.log('Login successful, navigating to search');
        this.router.navigate(['/search']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleForm() {
    this.isSignUpMode = !this.isSignUpMode;
    // Clear forms when toggling
    if (this.isSignUpMode) {
      this.logInObj = new LogInModel();
      this.errorMessage = '';
    } else {
      this.signUpObj = new SignUpModel();
      this.errorMessage = '';
    }
  }

  logOut(){
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
