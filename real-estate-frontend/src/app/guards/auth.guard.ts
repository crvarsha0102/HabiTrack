import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  console.log(`AuthGuard activating for route: ${state.url}`);
  
  // For server-side rendering, be permissive to avoid blocking routes
  if (!isPlatformBrowser(platformId)) {
    console.log('AuthGuard: Server-side rendering detected, allowing access and deferring auth check to client');
    return true; // Allow navigation during SSR, authentication will be checked client-side
  }
  
  // For client-side, check if the user is authenticated
  const isAuthenticated = authService.isLoggedIn();
  console.log('AuthGuard: Authentication check result:', isAuthenticated);
  
  if (isAuthenticated) {
    console.log('AuthGuard: User is authenticated, allowing access to', state.url);
    return true;
  }
  
  console.log('AuthGuard: User is not authenticated, checking tokens...');
  
  // Last resort - check for token directly
  const token = localStorage.getItem('access_token');
  if (token) {
    console.log('AuthGuard: Token found in localStorage, allowing access');
    // Set the login flag to prevent future issues
    localStorage.setItem('isLoggedIn', 'true');
    return true;
  }
  
  // Check localStorage directly for any other indicators
  const storedUser = localStorage.getItem('currentUser');
  const loginFlag = localStorage.getItem('isLoggedIn');
  console.log('AuthGuard: localStorage check:', { 
    hasStoredUser: !!storedUser, 
    hasLoginFlag: !!loginFlag,
    storageKeys: Object.keys(localStorage).filter(key => 
      key.includes('token') || key.includes('user') || key.includes('login'))
  });
  
  if (storedUser || loginFlag === 'true') {
    console.log('AuthGuard: Found user data, allowing access');
    // Allow access if we have user data
    return true;
  }
  
  console.log('AuthGuard: No authentication found, redirecting to login');
  // Navigate to login page with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
}; 