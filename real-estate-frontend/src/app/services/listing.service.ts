import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Listing } from '../models/listing.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`; // Use environment configuration
  private listings: Listing[] = [];
  private _listings = new BehaviorSubject<Listing[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get listings$(): Observable<Listing[]> {
    return this._listings.asObservable();
  }

  createListing(listing: Listing): Observable<Listing> {
    // Get authentication token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    return this.http.post<Listing>(`${this.apiUrl}`, listing, { headers })
      .pipe(
        tap(newListing => {
          this.listings.push(newListing);
          this._listings.next([...this.listings]);
          console.log('Listing created successfully:', newListing);
        }),
        catchError(error => {
          console.error('Error creating listing:', error);
          
          if (error.status === 401) {
            // Authentication error
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          } else if (error.status === 400) {
            // Validation error or bad request
            const errorMessage = error.error?.message || 'Invalid listing data. Please check your inputs.';
            return throwError(() => new Error(errorMessage));
          } else {
            // Generic error or custom error message from backend
            const errorMessage = error.error?.message || error.message || 'Failed to create listing. Please try again later.';
            return throwError(() => new Error(errorMessage));
          }
        })
      );
  }

  getListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}`)
      .pipe(
        tap(listings => {
          this.listings = listings;
          this._listings.next([...this.listings]);
        }),
        catchError(error => {
          console.error('Error fetching listings:', error);
          return throwError(() => new Error('Failed to fetch listings. Please try again later.'));
        })
      );
  }

  getListingById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching listing with id ${id}:`, error);
          return throwError(() => new Error('Failed to fetch listing. Please try again later.'));
        })
      );
  }

  updateListing(id: number, updatedListing: Listing): Observable<Listing> {
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, updatedListing, { headers })
      .pipe(
        tap(updated => {
          const index = this.listings.findIndex(listing => listing.id === id);
          if (index !== -1) {
            this.listings[index] = updated;
            this._listings.next([...this.listings]);
          }
        }),
        catchError(error => {
          console.error('Error updating listing:', error);
          if (error.status === 401) {
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          } else {
            return throwError(() => new Error('Failed to update listing. Please try again later.'));
          }
        })
      );
  }

  deleteListing(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(() => {
          this.listings = this.listings.filter(listing => listing.id !== id);
          this._listings.next([...this.listings]);
        }),
        catchError(error => {
          console.error('Error deleting listing:', error);
          if (error.status === 401) {
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          } else {
            return throwError(() => new Error('Failed to delete listing. Please try again later.'));
          }
        })
      );
  }
} 