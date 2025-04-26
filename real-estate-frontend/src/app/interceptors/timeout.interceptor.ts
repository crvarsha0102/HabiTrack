import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

// Create a token for extended timeout
export const EXTENDED_TIMEOUT = new HttpContextToken(() => false);

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Default timeout is 10 seconds, extended timeout is 30 seconds
    const timeoutValue = request.context.get(EXTENDED_TIMEOUT) ? 30000 : 10000;

    return next.handle(request).pipe(
      timeout(timeoutValue),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            statusText: 'Timeout',
            error: { message: 'Request timed out. The server may be overloaded.' }
          }));
        }
        return throwError(() => err);
      })
    );
  }
} 