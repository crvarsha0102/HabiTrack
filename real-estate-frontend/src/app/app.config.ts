import { ApplicationConfig, provideZoneChangeDetection, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withViewTransitions(), // Enable smooth page transitions
      withComponentInputBinding() // Enable @Input() binding from route parameters
    ), 
    provideHttpClient(
      withFetch(), 
      withInterceptors([
        (req, next) => {
          // Get platform ID to check if we're in a browser
          const platformId = inject(PLATFORM_ID);
          const isBrowser = isPlatformBrowser(platformId);
          
          const reqUrl = req.url.toLowerCase();
          
          // Skip token for auth endpoints
          if (reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register')) {
            console.log(`Skipping auth for login/register endpoint: ${req.url}`);
            // Still ensure credentials are sent
            req = req.clone({ withCredentials: true });
            return next(req);
          }
          
          // Only try to access document in browser environment
          if (isBrowser) {
            // Get token from cookies
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
            let token = null;
            
            if (tokenCookie) {
              token = tokenCookie.split('=')[1].trim();
              console.log(`[Interceptor] Found token in cookies for ${req.url.split('/').pop()}, length: ${token?.length || 0}`);
            } else {
              console.log(`[Interceptor] No token in cookies for ${req.url.split('/').pop()}`);
            }
            
            // If no token in cookies, try localStorage as fallback
            if (!token) {
              token = localStorage.getItem('access_token');
              if (token) {
                console.log(`[Interceptor] Using token from localStorage for ${req.url.split('/').pop()}, length: ${token.length}`);
              } else {
                console.log(`[Interceptor] No token in localStorage for ${req.url.split('/').pop()}`);
                
                // Last resort: check if isLoggedIn flag is set
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (isLoggedIn) {
                  console.log(`[Interceptor] User is marked as logged in but no token found for ${req.url.split('/').pop()}`);
                }
              }
            }
            
            // Check if we have a token and it's properly formatted
            if (token && token.split('.').length === 3) {
              console.log(`[Interceptor] Adding Authorization header to request: ${req.url.split('/').pop()}`);
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
            } else {
              console.log(`[Interceptor] No valid token found for request: ${req.url.split('/').pop()}`);
            }
          }
          
          // Always add withCredentials to send cookies
          req = req.clone({ withCredentials: true });
          
          return next(req);
        }
      ])
    ),
    provideClientHydration(withEventReplay()),
  ]
};
