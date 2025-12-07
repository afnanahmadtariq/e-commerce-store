import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="profile-page">
      <div class="container">
        <h1>My Profile</h1>
        <div class="profile-layout">
          <aside class="profile-sidebar">
            <div class="profile-card card">
              <div class="avatar-section">
                <div class="avatar">{{ getUserInitials() }}</div>
                <h2>{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</h2>
                <p>{{ authService.currentUser()?.email }}</p>
              </div>
              <nav class="profile-nav">
                <button [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Personal Info</button>
                <a routerLink="/orders">Orders</a>
                <button (click)="logout()" class="logout-btn">Logout</button>
              </nav>
            </div>
          </aside>
          <main class="profile-main">
            <div class="card">
              <div class="card-header"><h2>Personal Information</h2></div>
              <div class="card-body">
                <form (ngSubmit)="updateProfile()">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="profileFirstName">First Name</label>
                      <input type="text" id="profileFirstName" class="form-input" [(ngModel)]="profileData.firstName" name="firstName" />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="profileLastName">Last Name</label>
                      <input type="text" id="profileLastName" class="form-input" [(ngModel)]="profileData.lastName" name="lastName" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="profilePhone">Phone</label>
                    <input type="tel" id="profilePhone" class="form-input" [(ngModel)]="profileData.phone" name="phone" />
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="updating">
                    {{ updating ? 'Saving...' : 'Save Changes' }}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-page { padding: var(--space-xl) 0 var(--space-3xl); }
    .profile-page h1 { font-size: 2rem; margin-bottom: var(--space-xl); }
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--space-xl); }
    @media (max-width: 1024px) { .profile-layout { grid-template-columns: 1fr; } }
    .profile-card { padding: var(--space-lg); }
    .avatar-section { text-align: center; padding-bottom: var(--space-lg); border-bottom: 1px solid var(--gray-100); margin-bottom: var(--space-lg); }
    .avatar { width: 80px; height: 80px; background: var(--gradient-primary); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; margin: 0 auto var(--space-md); }
    .avatar-section h2 { font-size: 1.125rem; margin-bottom: var(--space-xs); }
    .avatar-section p { font-size: 0.875rem; color: var(--gray-500); }
    .profile-nav { display: flex; flex-direction: column; gap: var(--space-xs); }
    .profile-nav button, .profile-nav a { display: flex; align-items: center; gap: var(--space-sm); width: 100%; padding: var(--space-sm) var(--space-md); background: none; border: none; border-radius: var(--radius-md); color: var(--gray-600); font-size: 0.9375rem; cursor: pointer; text-decoration: none; }
    .profile-nav button:hover, .profile-nav a:hover { background: var(--gray-50); color: var(--gray-900); }
    .profile-nav button.active { background: var(--primary-50); color: var(--primary-700); }
    .profile-nav .logout-btn { margin-top: var(--space-md); color: var(--error-600); }
    .profile-nav .logout-btn:hover { background: rgba(239, 68, 68, 0.1); }
    .card-header h2 { font-size: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent {
    authService = inject(AuthService);
    activeTab: 'info' | 'addresses' = 'info';
    profileData = { firstName: '', lastName: '', phone: '' };
    updating = false;

    constructor() {
        const user = this.authService.currentUser();
        if (user) {
            this.profileData = { firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' };
        }
    }

    getUserInitials(): string {
        const user = this.authService.currentUser();
        if (!user) return '?';
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    updateProfile(): void {
        this.updating = true;
        this.authService.updateProfile(this.profileData).subscribe({
            next: () => { this.updating = false; },
            error: () => { this.updating = false; }
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
