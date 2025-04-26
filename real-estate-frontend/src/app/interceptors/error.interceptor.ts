import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Log outgoing requests
    console.log(`HTTP Request: ${request.method} ${request.url}`);
    
    return next.handle(request).pipe(
      tap(event => {
        // You can log successful responses here if needed
      }),
      catchError((error: HttpErrorResponse) => {
        // Log detailed error information
        console.error('HTTP Error Interceptor:', {
          url: request.url,
          method: request.method,
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        // Use the centralized error service to handle the error
        return this.errorService.handleError(error);
      })
    );
  }
} 