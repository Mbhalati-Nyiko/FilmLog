import { Component, OnInit } from '@angular/core';
import { IonInput, IonToast } from "@ionic/angular/standalone";
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication-service';
import { Router, ActivatedRoute } from '@angular/router';  // Add ActivatedRoute
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonToast, IonInput, ReactiveFormsModule, CommonModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isSignUpMode: boolean = false;
  myImagePath = "assets/logo/FilmLog-Logo2.jpg";
  isLoading = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';
  returnUrl: string = '/search';  // Default return URL

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,  // Add this
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/search';

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  async onRegister() {
    if (this.signupForm.invalid) {
      this.showToastMessage('Please fill all fields correctly', 'warning');
      return;
    }

    this.isLoading = true;
    const signUpObj = this.signupForm.value;

    try {
      const response = await firstValueFrom(
        this.authService.onRegister(signUpObj)
      );

      console.log('Registration successful', response);
      this.resetForms();
      this.isSignUpMode = false;
      this.showToastMessage('Registration successful! Please login.', 'success');

    } catch (error: any) {
      this.showToastMessage(error.message || 'Registration failed', 'danger');
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.showToastMessage('Please enter username and password', 'warning');
      return;
    }

    this.isLoading = true;
    const logInObj = this.loginForm.value;

    try {
      const response = await firstValueFrom(
        this.authService.login(logInObj)
      );

      console.log('Login successful', response);
      this.resetForms();

      // Navigate to return URL instead of always going to search
      this.router.navigate([this.returnUrl]);

    } catch (error: any) {
      this.showToastMessage(error.message || 'Invalid username or password', 'danger');
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private resetForms(): void {
    this.signupForm.reset();
    this.loginForm.reset();
  }

  toggleForm() {
    this.isSignUpMode = !this.isSignUpMode;
    this.resetForms();
  }

  showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showUsers() {
    console.log('Local storage:', localStorage);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Is authenticated:', this.authService.isAuthenticated());
  }
}
