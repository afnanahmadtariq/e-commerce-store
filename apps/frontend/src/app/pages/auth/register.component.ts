import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card card">
          <div class="auth-header">
            <a routerLink="/" class="logo">
              <span class="logo-icon">🛍️</span>
              <span class="logo-text">ShopVerse</span>
            </a>
            <h1>Create an account</h1>
            <p>Join us and start shopping today</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div *ngIf="error" class="alert alert-error">
              <ng-container *ngIf="isArray(error); else singleError">
                <ul style="margin:0; padding-left:1.2em;">
                  <li *ngFor="let errMsg of error">{{ errMsg }}</li>
                </ul>
              </ng-container>
              <ng-template #singleError>{{ error }}</ng-template>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName"
                  class="form-input" 
                  [(ngModel)]="data.firstName"
                  name="firstName"
                  placeholder="John"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName"
                  class="form-input" 
                  [(ngModel)]="data.lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input 
                type="email" 
                id="email"
                class="form-input" 
                [(ngModel)]="data.email"
                name="email"
                placeholder="john&#64;example.com"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Phone (Optional)</label>
              <input 
                type="tel" 
                id="phone"
                class="form-input" 
                [(ngModel)]="data.phone"
                name="phone"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="password-input">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password"
                  class="form-input" 
                  [(ngModel)]="data.password"
                  name="password"
                  placeholder="Min. 8 characters"
                  required
                  minlength="8"
                />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  @if (showPassword) {
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  } @else {
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  }
                </button>
              </div>
              <p class="form-hint">Must be at least 8 characters with uppercase, lowercase, and number</p>
            </div>

            <div class="form-group">
              <label class="terms-check">
                <input type="checkbox" [(ngModel)]="acceptTerms" name="terms" required />
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loading || !acceptTerms">
              @if (loading) {
                <div class="spinner spinner-sm"></div>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="auth-alt">
            <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%);
      padding: var(--space-lg);
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
    }

    .auth-card {
      padding: var(--space-2xl);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .auth-header .logo {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .auth-header h1 {
      font-size: 1.5rem;
      margin-bottom: var(--space-xs);
    }

    .auth-header p {
      color: var(--gray-500);
    }

    .alert {
      padding: var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error-600);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .password-input {
      position: relative;
    }

    .password-input .form-input {
      padding-right: 3rem;
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: 0.25rem;
    }

    .form-hint {
      font-size: 0.75rem;
      color: var(--gray-500);
      margin-top: var(--space-xs);
    }

    .terms-check {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      font-size: 0.875rem;
      color: var(--gray-600);
      cursor: pointer;
    }

    .terms-check input {
      margin-top: 2px;
      accent-color: var(--primary-600);
    }

    .terms-check a {
      color: var(--primary-600);
    }

    .submit-btn {
      width: 100%;
      margin-top: var(--space-md);
    }

    .auth-alt {
      text-align: center;
      margin-top: var(--space-lg);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--gray-100);
    }

    .auth-alt p {
      color: var(--gray-600);
      font-size: 0.9375rem;
    }

    .auth-alt a {
      color: var(--primary-600);
      font-weight: 600;
    }
  `]
})
export class RegisterComponent {
      isArray = Array.isArray;
    authService = inject(AuthService);
    router = inject(Router);

    data: RegisterRequest = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    };

    loading = false;
    error: string | string[] = '';
    showPassword = false;
    acceptTerms = false;

    onSubmit(): void {
        if (!this.data.email || !this.data.password || !this.data.firstName || !this.data.lastName) {
            this.error = 'Please fill in all required fields';
            return;
        }

        if (this.data.password.length < 8) {
            this.error = 'Password must be at least 8 characters';
            return;
        }

        if (!this.acceptTerms) {
            this.error = 'Please accept the terms and conditions';
            return;
        }

        this.loading = true;
        this.error = '';

        // If phone is empty string, set to undefined so backend treats as optional
        const submitData = { ...this.data, phone: this.data.phone?.trim() ? this.data.phone : undefined };

        this.authService.register(submitData).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                // If backend returns validation errors array, display all
                if (err && err.errors && Array.isArray(err.errors)) {
                  this.error = err.errors.map((e: { message?: string } | string) => typeof e === 'string' ? e : e.message || 'Validation error');
                } else if (typeof err === 'string') {
                    this.error = err;
                } else if (err && err.message) {
                    this.error = err.message;
                } else {
                    this.error = 'Registration failed. Please try again.';
                }
            }
        });
    }
}
