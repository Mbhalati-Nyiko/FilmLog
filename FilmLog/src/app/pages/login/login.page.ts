import { User } from './../../models/userModel';
// login.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput, IonToggle, IonToast } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication-service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [IonToast, IonInput, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  signUpObj: SignUpModel = new SignUpModel();
  logInObj: LogInModel = new LogInModel();
  isSignUpMode: boolean = false;
  myImagePath = "assets/logo/FilmLog-Logo2.jpg";
  isLoading = false;
  errorMessage = '';
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';

  @ViewChild('toggle') toggleRef!: ElementRef<IonToggle>;
  @ViewChild('loginContainer') loginContainerRef!: ElementRef;
  @ViewChild('ion-input') inputRef!: ElementRef<IonInput>;

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

  showUsers(){
    console.log(localStorage)
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
      this.showToastMessage('Registration successful! Please login.', 'success');
      alert('Registration successful! Please login.');
      // Clear inputs
      this.signupForm.reset();
      this.loginForm.reset();

    } else {
      //Delete all users for testing purposes
      // this.deleteAllUser();
      // console.log(localStorage)
      this.showToastMessage('Registration failed. User may already exist.', 'danger');
      this.errorMessage = 'Registration failed. User may already exist.';
      console.error('Registration failed');
    }

    this.isLoading = false;
  }

  // Delete all users
  deleteAllUser(){
    localStorage.clear();
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const success = this.authService.login(this.logInObj);
      if (success) {
        // Clear inputs
        this.signupForm.reset();
        this.loginForm.reset();
        console.log('Login successful, navigating to search');
        this.router.navigate(['/search']);
      } else {
        this.showToastMessage('Invalid username or password', 'danger');
        this.errorMessage = 'Invalid username or password';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred. Please try again.';
      this.showToastMessage(this.errorMessage, 'danger');
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

  showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
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
