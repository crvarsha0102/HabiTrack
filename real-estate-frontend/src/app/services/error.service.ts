import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('Client side error:', error.error.message);
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        // Try to get message from the API response
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
      
      console.error(`Server side error: ${error.status}`, error);
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
  
  /**
   * Format error for display in UI
   */
  getFormattedError(error: any): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else if (error?.error?.message) {
      return error.error.message;
    } else {
      return 'An unknown error occurred';
    }
  }
} 