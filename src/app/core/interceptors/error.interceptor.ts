import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
        console.error('Client-side error:', errorMessage);
      } else {
        // Server-side error
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;

        // Handle specific status codes
        switch (error.status) {
          case 401:
            // Unauthorized - redirect to login
            console.error('Unauthorized access - redirecting to login');
            localStorage.removeItem('accessToken');
            router.navigate(['/login']);
            break;
          case 403:
            // Forbidden
            console.error('Access denied:', errorMessage);
            break;
          case 404:
            // Not found
            console.error('Resource not found:', errorMessage);
            break;
          case 500:
            // Internal server error
            console.error('Server error:', errorMessage);
            break;
          default:
            console.error('HTTP error:', errorMessage);
        }
      }

      return throwError(() => error);
    })
  );
};
