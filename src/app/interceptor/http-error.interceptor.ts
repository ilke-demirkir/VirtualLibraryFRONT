import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { ToastComponent } from '../components/toast/toast.component';

let isAuthErrorHandled = false;

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let userMessage = 'An unexpected error occurred.';
        const isLoginRequest = req.url.includes('/login');
        const isRegisterRequest = req.url.includes('/register');
        const isPublicEndpoint = isLoginRequest || isRegisterRequest;

        if (error.status === 0) {
          userMessage = 'Network error: Please check your internet connection.';
        } else if (error.status === 401) {
          userMessage = 'You must be logged in.';
          if (!isPublicEndpoint) {
            if (!isAuthErrorHandled) {
              isAuthErrorHandled = true;
              this.router.navigate(['/login']);
              ToastComponent.show(userMessage);
              setTimeout(() => isAuthErrorHandled = false, 2000); // Reset after 2s
            }
          }
          // For login/register requests, let the component handle the error
          return throwError(() => error);
        } else if (error.status === 403) {
          userMessage = 'You are not allowed to perform this action.';
          ToastComponent.show(userMessage);
          return EMPTY;
        } else if (error.status === 404) {
          userMessage = 'Resource not found.';
          ToastComponent.show(userMessage);
          return EMPTY;
        } else if (error.status >= 500) {
          userMessage = 'A server error occurred. Please try again later.';
          ToastComponent.show(userMessage);
          return EMPTY; // Prevent bubbling to global handler/component
        }

        // If backend provides a message, use it
        if (error.error && error.error.message) {
          userMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          userMessage = error.error;
        }

        // Only show toast if not a public endpoint or not a 401 or 400
        if (!((error.status === 401 && isPublicEndpoint) || (isPublicEndpoint && error.status === 400))) {
          ToastComponent.show(userMessage);
        }

        console.error('🚨 API error:', error);
        return throwError(() => error);
      })
    );
  }
}
