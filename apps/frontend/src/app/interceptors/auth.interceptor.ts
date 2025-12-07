import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    const token = authService.getAccessToken();
    const sessionId = isPlatformBrowser(platformId) ? localStorage.getItem('cart_session_id') || '' : '';

    let modifiedReq = req;

    if (token || sessionId) {
        const headers: { [key: string]: string } = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (sessionId) {
            headers['X-Session-ID'] = sessionId;
        }

        modifiedReq = req.clone({
            setHeaders: headers
        });
    }

    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        })
    );
};
