import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for authentication requests
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return next.handle(request);
    }

    // Get token from AuthService
    const token = this.authService.getToken();
    
    // Add withCredentials to all requests to ensure cookies are sent
    request = request.clone({ withCredentials: true });
    
    if (token) {
      // Only add token if it's valid JWT format (contains 2 periods)
      if (token.split('.').length === 3) {
        // Add the token to the request
        request = this.addTokenToRequest(request, token);
      } else {
        console.warn('Invalid token format detected - not adding to request headers');
      }
    }

    return next.handle(request).pipe(
      catchError(error => {
        console.log('HTTP Error in interceptor:', error);
        
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            // Try refreshing the token if we get a 401
            console.log('Attempting to refresh token due to 401 error');
            return this.handle401Error(request, next);
          } else if (error.status === 403) {
            // Handle forbidden errors - might need to redirect to login
            console.error('Access forbidden. User may need to login again.');
            this.authService.logout(); // Force logout on 403
            return throwError(() => error);
          } else {
            // For other HTTP errors, log but pass through
            console.error(`HTTP Error (${error.status}):`, error.message);
          }
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      console.log('Token expired or invalid, logging out user');
      
      // Token expired, log the user out
      this.authService.logout();
      this.isRefreshing = false;
    }
    return throwError(() => new Error('Session expired. Please login again.'));
  }
} 