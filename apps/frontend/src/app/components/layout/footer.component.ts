import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <a routerLink="/" class="logo">
              <span class="logo-icon">🛍️</span>
              <span class="logo-text">ShopVerse</span>
            </a>
            <p>Your one-stop destination for premium products. Quality meets affordability.</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44,4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96,1.32-2.02-.88.52-1.86.9-2.9,1.1-.82-.88-2-1.43-3.3-1.43-2.5,0-4.55,2.04-4.55,4.54,0,.36.03.7.1,1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6,1.45-.6,2.3,0,1.56.8,2.95,2,3.77-.74-.03-1.44-.23-2.05-.57v.06c0,2.2,1.56,4.03,3.64,4.44-.67.2-1.37.2-2.06.08.58,1.8,2.26,3.12,4.25,3.16C5.78,18.1,3.37,18.74,1,18.46c2,1.3,4.4,2.04,6.97,2.04,8.35,0,12.92-6.92,12.92-12.93,0-.2,0-.4-.02-.6.9-.63,1.96-1.22,2.56-2.14Z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.16c3.2,0,3.58.01,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33.01,7.05.07c-4.27.2-6.78,2.71-6.98,6.98C0,8.33,0,8.74,0,12s.01,3.67.07,4.95c.2,4.27,2.71,6.78,6.98,6.98,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c4.27-.2,6.78-2.71,6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.27-2.71-6.78-6.98-6.98C15.67.01,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z"/></svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-links">
            <h4>Quick Links</h4>
            <a routerLink="/products">All Products</a>
            <a routerLink="/categories">Categories</a>
            <a routerLink="/products?featured=true">Featured</a>
            <a routerLink="/products?sort=newest">New Arrivals</a>
          </div>

          <!-- Customer Service -->
          <div class="footer-links">
            <h4>Customer Service</h4>
            <a href="#">Contact Us</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </div>

          <!-- Contact -->
          <div class="footer-contact">
            <h4>Contact Us</h4>
            <p>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              support&#64;shopverse.com
            </p>
            <p>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              +1 (555) 123-4567
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} ShopVerse. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: var(--gray-900);
      color: var(--gray-300);
      padding: var(--space-3xl) 0 var(--space-lg);
      margin-top: auto;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: var(--space-2xl);
    }

    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .footer-brand .logo {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }

    .footer-brand .logo-icon {
      font-size: 1.5rem;
    }

    .footer-brand .logo-text {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .footer-brand p {
      color: var(--gray-400);
      margin-bottom: var(--space-lg);
      line-height: 1.6;
    }

    .social-links {
      display: flex;
      gap: var(--space-md);
    }

    @media (max-width: 640px) {
      .social-links {
        justify-content: center;
      }
    }

    .social-links a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--gray-800);
      border-radius: var(--radius-full);
      color: var(--gray-400);
      transition: all var(--transition-fast);
    }

    .social-links a:hover {
      background: var(--primary-600);
      color: white;
      transform: translateY(-2px);
    }

    .footer-links h4,
    .footer-contact h4 {
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-lg);
    }

    .footer-links a {
      display: block;
      color: var(--gray-400);
      margin-bottom: var(--space-sm);
      transition: color var(--transition-fast);
    }

    .footer-links a:hover {
      color: white;
    }

    .footer-contact p {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--gray-400);
      margin-bottom: var(--space-sm);
    }

    @media (max-width: 640px) {
      .footer-contact p {
        justify-content: center;
      }
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-xl);
      margin-top: var(--space-2xl);
      border-top: 1px solid var(--gray-800);
    }

    @media (max-width: 640px) {
      .footer-bottom {
        flex-direction: column;
        gap: var(--space-md);
      }
    }

    .footer-bottom p {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .footer-bottom-links {
      display: flex;
      gap: var(--space-lg);
    }

    .footer-bottom-links a {
      color: var(--gray-500);
      font-size: 0.875rem;
      transition: color var(--transition-fast);
    }

    .footer-bottom-links a:hover {
      color: white;
    }
  `]
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
}
