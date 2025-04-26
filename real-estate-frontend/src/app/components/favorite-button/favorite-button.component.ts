import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
      (click)="toggleFavorite($event)"
      [disabled]="isLoading"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        [ngClass]="isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-500'"
        class="w-5 h-5">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  `,
  styles: []
})
export class FavoriteButtonComponent implements OnInit {
  @Input() listingId: number | undefined;
  isFavorite: boolean = false;
  isLoading: boolean = false;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.checkFavoriteStatus();
  }
  
  checkFavoriteStatus(): void {
    if (!this.listingId || !this.authService.isLoggedIn()) {
      return;
    }
    
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/favorites/${this.listingId}/check`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle error gracefully and return a default response
          console.error('Error checking favorite status:', error);
          return of({ success: false, data: false });
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.isFavorite = response.data;
          }
          this.isLoading = false;
        }
      });
  }
  
  toggleFavorite(event: Event): void {
    // Prevent click event from bubbling up to parent elements
    event.preventDefault();
    event.stopPropagation();
    
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      alert('Please log in to save favorites.');
      return;
    }
    
    // Check if we have a valid listing ID
    if (!this.listingId) {
      console.error('No listing ID provided');
      return;
    }
    
    // Prevent rapid clicking
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    // Call backend API to toggle favorite status
    this.http.post<any>(`${environment.apiUrl}/favorites/${this.listingId}/toggle`, {})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error toggling favorite status:', error);
          // Return default response to avoid breaking the UI
          return of({ success: false, data: this.isFavorite, message: 'Failed to update favorite status' });
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.isFavorite = response.data;
            console.log(response.message);
          }
          this.isLoading = false;
        }
      });
  }
} 