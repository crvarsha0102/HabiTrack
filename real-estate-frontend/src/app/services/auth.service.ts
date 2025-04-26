import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, Subject } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // New subject to emit when a user is registered
  private userRegisteredSubject = new Subject<User>();
  public userRegistered$ = this.userRegisteredSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/auth`;
  private isBrowser: boolean;
  private useMockData = false; // Use real backend for authentication
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUser();
    }
  }
  
  private loadUser(): void {
    if (!this.isBrowser) return;
    
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      this.currentUserSubject.next(null);
    }
  }
  
  // Method to set cookie in the browser
  private setCookie(name: string, value: string, days: number = 7): void {
    if (!this.isBrowser) return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    
    // Also store in localStorage as backup
    if (name === 'access_token') {
      localStorage.setItem('access_token', value);
    }
  }
  
  // Method to get cookie from browser
  private getCookie(name: string): string | null {
    if (!this.isBrowser) return null;
    
    // First try to get from cookie
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const token = c.substring(nameEQ.length, c.length);
        // If it's an access token, also update localStorage
        if (name === 'access_token') {
          localStorage.setItem('access_token', token);
        }
        return token;
      }
    }
    
    // If not found in cookie but it's an access token, try localStorage
    if (name === 'access_token') {
      return localStorage.getItem('access_token');
    }
    
    return null;
  }
  
  // Method to delete cookie
  private deleteCookie(name: string): void {
    if (!this.isBrowser) return;
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    
    // Also remove from localStorage if it's an access token
    if (name === 'access_token') {
      localStorage.removeItem('access_token');
    }
  }
  
  login(emailOrData: string | { email: string, password: string }, passwordParam?: string): Observable<User> {
    console.log('Login attempt received:', emailOrData);
    let email: string;
    let password: string;
  
    // Handle both object and individual parameters
    if (typeof emailOrData === 'object' && emailOrData !== null) {
      email = emailOrData.email;
      password = emailOrData.password;
    } else {
      email = emailOrData;
      password = passwordParam || '';
    }
    
    console.log('Attempting to login with email:', email);
    
    if (this.useMockData) {
      return this.loginWithMockData(email, password);
    }
    
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest, { 
      withCredentials: true, 
      observe: 'response' 
    }).pipe(
      tap(fullResponse => {
        console.log('Full login response:', fullResponse);
        
        const response = fullResponse.body;
        if (!response) {
          console.error('No response body returned');
          return;
        }
        
        console.log('Login successful:', response);
        
        // The backend API returns a nested structure with data.user
        const user = response.data?.user || response.user;
        if (!user) {
          console.error('No user data in response');
          return;
        }
        
        // Save user to localStorage
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Important! For our API structure, extract token and save it
          // We need to do this because our JWT is in a HttpOnly cookie which
          // JavaScript can't access, but we also want to save a copy in localStorage
          
          // Use our helper to extract token from response
          const accessToken = this.extractAccessToken(response);
          
          if (accessToken) {
            console.log('Found token in response, setting manually');
            // Set both cookie and localStorage
            this.setCookie('access_token', accessToken);
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            // Even without an explicit token, we should have received an HttpOnly cookie
            // But we need to set the login flag anyway so our isLoggedIn check works
            console.log('No explicit token in response, but should have HttpOnly cookie');
            localStorage.setItem('isLoggedIn', 'true');
          }
        }
        
        // Update the current user subject
        this.currentUserSubject.next(user);
      }),
      map(response => {
        const userData = response.body?.data?.user || response.body?.user;
        if (!userData) {
          throw new Error('User data not found in response');
        }
        return userData;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }
  
  // Helper method for mock login
  private loginWithMockData(email: string, password: string): Observable<User> {
    // Check if we already have a stored user with this email (for demo purposes)
    if (this.isBrowser) {
      const storedUserJson = localStorage.getItem('registeredUser_' + email);
      if (storedUserJson) {
        try {
          const storedUser = JSON.parse(storedUserJson);
          
          // Use the stored user information
          const user: User = {
            id: storedUser.id || new Date().getTime(), // Use existing ID or generate new one
            firstName: storedUser.firstName,
            lastName: storedUser.lastName,
            email: email,
            phone: storedUser.phone || '',
            role: UserRole.USER,
            bio: storedUser.bio || ''
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          // Generate a proper JWT token for mock mode
          const mockToken = this.generateMockJwtToken(user);
          this.setCookie('access_token', mockToken);
          
          return of(user);
        } catch (error) {
          console.error('Error parsing stored user', error);
        }
      }
    }
    
    // Fallback to default user if no stored user found
    const user = {
      id: new Date().getTime(), // Generate unique ID
      firstName: 'John',
      lastName: 'Doe',
      email: email,
      phone: '(123) 456-7890',
      role: UserRole.USER,
      bio: 'Real estate enthusiast'
    };
    
    if (this.isBrowser) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
    
    this.currentUserSubject.next(user);
    
    // Generate a proper JWT token for mock mode
    const mockToken = this.generateMockJwtToken(user);
    this.setCookie('access_token', mockToken);
    
    return of(user);
  }
  
  // Helper method to generate a mock JWT token
  private generateMockJwtToken(user: User, expirationDays: number = 1): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      sub: user.email,
      id: user.id,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60)
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa('mock-secret-key');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  register(
    firstNameOrData: string | { firstName: string, lastName: string, email: string, password: string, phone?: string },
    lastNameParam?: string,
    emailParam?: string,
    passwordParam?: string,
    phoneParam?: string
  ): Observable<User> {
    let firstName: string;
    let lastName: string;
    let email: string;
    let password: string;
    let phone: string | undefined;
    
    // Handle both object and individual parameters
    if (typeof firstNameOrData === 'object' && firstNameOrData !== null) {
      firstName = firstNameOrData.firstName;
      lastName = firstNameOrData.lastName;
      email = firstNameOrData.email;
      password = firstNameOrData.password;
      phone = firstNameOrData.phone;
    } else {
      firstName = firstNameOrData;
      lastName = lastNameParam || '';
      email = emailParam || '';
      password = passwordParam || '';
      phone = phoneParam;
    }
    
    console.log('Attempting to register user:', email);
    
    if (this.useMockData) {
      return this.registerWithMockData(firstName, lastName, email, password, phone);
    }
    
    const registerRequest: RegisterRequest = {
      firstName,
      lastName,
      email,
      password,
      phone,
      role: UserRole.USER
    };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Registration successful:', response);
        
        // The backend API returns a nested structure
        const user = response.data?.user || response.user;
        if (!user) {
          console.error('No user data in response');
          return;
        }
        
        // Save user to localStorage
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Important! For our API structure, extract token and save it
          // We need to do this because our JWT is in a HttpOnly cookie which
          // JavaScript can't access, but we also want to save a copy in localStorage
          
          // Use our helper to extract token from response
          const accessToken = this.extractAccessToken(response);
          
          if (accessToken) {
            console.log('Found token in registration response, setting manually');
            // Set both cookie and localStorage
            this.setCookie('access_token', accessToken);
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            // Even without an explicit token, we should have received an HttpOnly cookie
            // But we need to set the login flag anyway so our isLoggedIn check works
            console.log('No explicit token in response, but should have HttpOnly cookie');
            localStorage.setItem('isLoggedIn', 'true');
          }
        }
        
        // Update the current user subject
        this.currentUserSubject.next(user);
        
        // Emit the registered user
        this.userRegisteredSubject.next(user);
      }),
      map(response => {
        const userData = response.data?.user || response.user;
        if (!userData) {
          throw new Error('User data not found in response');
        }
        return userData;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }
  
  // Helper method for mock registration
  private registerWithMockData(firstName: string, lastName: string, email: string, password: string, phone?: string): Observable<User> {
    const userId = new Date().getTime(); // Generate unique ID
    const user = {
      id: userId,
      firstName,
      lastName,
      email,
      phone: phone || '',
      role: UserRole.USER,
      bio: ''
    };
    
    // Store user in localStorage and update currentUserSubject
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Also store registration information for future logins
      localStorage.setItem('registeredUser_' + email, JSON.stringify({
        id: userId,
        firstName,
        lastName,
        email,
        phone,
        role: UserRole.USER,
        bio: ''
      }));
    }
    
    this.currentUserSubject.next(user);
    
    // Emit event for newly registered user
    this.userRegisteredSubject.next(user);
    
    // Generate a proper JWT token for mock mode
    const mockToken = this.generateMockJwtToken(user);
    this.setCookie('access_token', mockToken);
    
    return of(user);
  }
  
  logout(): void {
    if (this.isBrowser) {
      // Clear tokens from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      
      // Clear all potential auth cookies
      this.deleteCookie('access_token');
      
      // Clear more thoroughly
      try {
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.split("=")[0].trim();
          if (cookieName.includes('token') || cookieName === 'access_token') {
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        });
      } catch (error) {
        console.error('Error clearing cookies:', error);
      }
      
      // Reset current user
      this.currentUserSubject.next(null);
      
      // For server-side integration, also make a logout API call
      this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
        .subscribe({
          next: () => console.log('Logout API call successful'),
          error: (error) => console.error('Logout API call failed:', error)
        });
    }
  }
  
  updateProfile(userData: Partial<User>): Observable<User> {
    // For development/demo purposes:
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('Not logged in'));
    }
    
    const updatedUser = { ...currentUser, ...userData };
    
    if (this.isBrowser) {
      // Update the current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Also update the registered user info for future logins
      const email = currentUser.email;
      if (email) {
        const storedUserJson = localStorage.getItem('registeredUser_' + email);
        if (storedUserJson) {
          try {
            const storedUser = JSON.parse(storedUserJson);
            const updatedStoredUser = { ...storedUser, ...userData };
            localStorage.setItem('registeredUser_' + email, JSON.stringify(updatedStoredUser));
          } catch (error) {
            console.error('Error updating registered user info:', error);
          }
        }
      }
    }
    
    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
    
    /* Uncomment when backend is ready
    return this.http.put<User>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(updatedUser => {
          if (this.isBrowser) {
            // Update stored user
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
          this.currentUserSubject.next(updatedUser);
        }),
        catchError(error => {
          console.error('Profile update error', error);
          return throwError(() => new Error('Profile update failed. Please try again.'));
        })
      );
    */
  }
  
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // For development/demo purposes:
    return of({ success: true });
    
    /* Uncomment when backend is ready
    return this.http.post<any>(`${this.apiUrl}/change-password`, { currentPassword, newPassword })
      .pipe(
        catchError(error => {
          console.error('Password change error', error);
          return throwError(() => new Error('Password change failed. Please check your current password.'));
        })
      );
    */
  }
  
  // Add forgot password functionality
  forgotPassword(email: string): Observable<any> {
    // For development/demo purposes to avoid sending real emails during testing
    if (this.useMockData) {
      console.log('Mock forgot password for:', email);
      return of({ success: true });
    }
    
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, null, { 
      params: { email }
    }).pipe(
      catchError(error => {
        console.error('Forgot password error:', error);
        return throwError(() => new Error('Failed to process password reset request. Please try again.'));
      })
    );
  }
  
  // Add reset password functionality
  resetPassword(token: string, newPassword: string): Observable<any> {
    // For development/demo purposes
    if (this.useMockData) {
      console.log('Mock reset password with token:', token);
      return of({ success: true });
    }
    
    return this.http.post<any>(`${this.apiUrl}/reset-password`, null, { 
      params: { token, newPassword }
    }).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        return throwError(() => new Error('Failed to reset password. The link may have expired or is invalid.'));
      })
    );
  }
  
  // Improved token retrieval method
  public getToken(): string | null {
    if (!this.isBrowser) return null;
    
    // Check in localStorage first
    const localToken = localStorage.getItem('access_token');
    if (localToken) {
      return localToken;
    }
    
    // If not in localStorage, check cookies more thoroughly
    try {
      // More thorough cookie search
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'access_token' && value) {
          // Store it in localStorage too for future reference
          localStorage.setItem('access_token', value);
          return value;
        }
      }
    } catch (error) {
      console.error('Error checking cookies for token:', error);
    }
    
    // If we have a logged in flag but no token, try to refresh the token
    if (localStorage.getItem('isLoggedIn') === 'true') {
      console.log('Token not found but user is logged in - should try refreshing token');
      // We would call refresh token here in a real implementation
    }
    
    return null;
  }
  
  // Helper method to extract token from various response formats
  private extractAccessToken(response: any): string | undefined {
    // Try to find token in various locations
    if (response.accessToken) {
      return response.accessToken;
    }
    
    if (response.data?.accessToken) {
      return response.data.accessToken;
    }
    
    // Look inside cookie property if it exists
    if (response.data?.cookie) {
      const cookie = response.data.cookie;
      if (cookie && cookie.name === 'access_token' && cookie.value) {
        return cookie.value;
      }
    }
    
    return undefined;
  }

  // Improve isLoggedIn check to be more permissive
  isLoggedIn(): boolean {
    // Get the current user
    const currentUser = this.currentUserSubject.value;
    const hasUser = !!currentUser;
    
    // Check for token
    const token = this.getToken();
    const hasToken = !!token;
    
    // Check for login flag
    const hasLoginFlag = this.isBrowser && localStorage.getItem('isLoggedIn') === 'true';
    
    // Debug logging
    console.log('isLoggedIn detailed check:', { 
      hasUser, 
      hasToken, 
      hasLoginFlag,
      currentUser: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'null',
      token: token ? `${token.substring(0, 10)}...` : 'null',
      cookies: this.isBrowser ? document.cookie : 'not in browser'
    });
    
    // Be more permissive - consider logged in if any condition is true
    // This is because in some cases we might have a valid HttpOnly cookie
    // even if we don't have the token in localStorage
    return hasUser || hasToken || hasLoginFlag;
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  // For debugging purposes - list all registered users
  public listAllRegisteredUsers(): { email: string, user: any }[] {
    if (!this.isBrowser) return [];
    
    const users: { email: string, user: any }[] = [];
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('registeredUser_')) {
          const email = key.replace('registeredUser_', '');
          const userJson = localStorage.getItem(key);
          if (userJson) {
            users.push({ 
              email, 
              user: JSON.parse(userJson) 
            });
          }
        }
      });
    } catch (error) {
      console.error('Error listing registered users:', error);
    }
    
    return users;
  }
  
  // Helper method to get Authorization headers for HTTP requests
  public getAuthHeaders(): { [key: string]: string } | undefined {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : undefined;
  }
  
  refreshToken(): Observable<any> {
    if (this.isBrowser) {
      // In mock mode, just return a new token
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        const mockToken = this.generateMockJwtToken(currentUser);
        this.setCookie('access_token', mockToken);
        
        return of({
          accessToken: mockToken,
          refreshToken: this.generateMockJwtToken(currentUser, 30) // longer expiration for refresh token
        });
      }
    }
    
    // Fallback or when no user is logged in
    return of({
      accessToken: '',
      refreshToken: ''
    });
  }
} 