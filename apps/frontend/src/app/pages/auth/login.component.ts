import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
    selector: 'app-login',
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
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            @if (error) {
              <div class="alert alert-error">{{ error }}</div>
            }

            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input 
                type="email" 
                id="email"
                class="form-input" 
                [(ngModel)]="credentials.email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="password-input">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password"
                  class="form-input" 
                  [(ngModel)]="credentials.password"
                  name="password"
                  placeholder="Enter your password"
                  required
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
            </div>

            <div class="form-footer">
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="loading">
              @if (loading) {
                <div class="spinner spinner-sm"></div>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="auth-alt">
            <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
          </div>

          <div class="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin&#64;ecommerce.com / Admin&#64;123</p>
            <p>Customer: customer&#64;ecommerce.com / Customer&#64;123</p>
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
      max-width: 440px;
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

    .toggle-password:hover {
      color: var(--gray-600);
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      margin-bottom: var(--space-lg);
    }

    .forgot-link {
      font-size: 0.875rem;
      color: var(--primary-600);
    }

    .submit-btn {
      width: 100%;
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

    .demo-credentials {
      margin-top: var(--space-lg);
      padding: var(--space-md);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
    }

    .demo-credentials p {
      margin: 0;
      color: var(--gray-600);
    }

    .demo-credentials strong {
      color: var(--gray-800);
    }
  `]
})
export class LoginComponent {
    authService = inject(AuthService);
    router = inject(Router);

    credentials: LoginRequest = {
        email: '',
        password: ''
    };

    loading = false;
    error = '';
    showPassword = false;

    onSubmit(): void {
        if (!this.credentials.email || !this.credentials.password) {
            this.error = 'Please fill in all fields';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.login(this.credentials).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.loading = false;
                this.error = typeof err === 'string' ? err : 'Login failed. Please check your credentials.';
            }
        });
    }
}
