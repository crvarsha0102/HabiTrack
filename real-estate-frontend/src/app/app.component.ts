import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { filter } from 'rxjs/operators';
import { interval } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AppComponent implements OnInit {
  title = 'real-estate-frontend';
  isLoggedIn = false;
  isAdmin = false;
  isMobileMenuOpen = false;
  currentYear = new Date().getFullYear();
  unreadMessageCount = 0;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkLoginStatus();

      // Check login status on navigation
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkLoginStatus();
      });

      // Set up periodic checking of unread messages (every 2 minutes)
      if (this.isLoggedIn) {
        this.checkUnreadMessages();
        interval(120000).subscribe(() => {
          if (this.isLoggedIn) {
            this.checkUnreadMessages();
          }
        });
      }

      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        this.isAdmin = user?.role === UserRole.ADMIN;
      });
    }
  }

  checkLoginStatus() {
    // Only run in browser environment
    if (!this.isBrowser) return;
    
    // First check for access_token cookie
    const cookies = document.cookie;
    console.log('Current cookies:', cookies); // Log cookies for debugging
    
    const hasAuthCookie = document.cookie
      .split('; ')
      .some(row => row.startsWith('access_token='));
    
    // Also check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    const loginFlag = localStorage.getItem('isLoggedIn');
    
    // Try getting the current user directly from the auth service
    const currentUser = this.authService.getCurrentUser();
    
    // Use the AuthService isLoggedIn method that combines both checks
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('App component auth status:', { 
      hasAuthCookie, 
      hasStoredUser: !!storedUser, 
      hasLoginFlag: !!loginFlag, 
      hasCurrentUser: !!currentUser,
      isLoggedIn: this.isLoggedIn,
      user: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'null'
    });
    
    if (this.isLoggedIn) {
      this.checkUnreadMessages();
      
      // If we have a cookie but no stored user, we need to fetch the user data
      if (hasAuthCookie && !storedUser) {
        this.fetchCurrentUser();
      }
    } else if (storedUser && !hasAuthCookie) {
      // If we have a stored user but no cookie, try to set the cookie
      const user = JSON.parse(storedUser);
      console.log('User stored but no cookie, attempting to restore session for', user.email);
      this.authService.refreshToken().subscribe({
        next: (response) => {
          if (response && response.accessToken) {
            this.checkLoginStatus(); // Check again after refreshing
          }
        }
      });
    }
  }
  
  private fetchCurrentUser() {
    this.http.get<any>(`${environment.apiUrl}/auth/current-user`).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('isLoggedIn', 'true');
        }
      },
      error: (error) => {
        console.error('Error fetching current user:', error);
      }
    });
  }

  checkUnreadMessages() {
    if (!this.isLoggedIn || !this.isBrowser) return;

    this.http.get<any>(`${environment.apiUrl}/messages/unread/count`).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.unreadMessageCount = response.data || 0;
        }
      },
      error: (error) => {
        // Don't show error in console in production
        console.error('Error checking unread messages:', error);
        
        // Set unread count to 0 when error occurs to avoid UI issues
        this.unreadMessageCount = 0;
        
        // Don't try to check messages again for a while if there's a server error
        if (error.status === 500) {
          // Maybe backend is down or restarting - don't spam it with requests
          // Will try again when user navigates due to NavigationEnd event
        }
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    // Use the AuthService for a consistent logout experience
    this.authService.logout();
    
    // Update login status
    this.isLoggedIn = false;
    
    // Navigate to home
    this.router.navigate(['/']);
  }
}
