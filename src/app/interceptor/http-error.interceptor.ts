import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          // 🔒 Unauthorized – maybe show message or redirect
          alert('⚠️ You must be logged in.');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          alert('⛔ You are not allowed to perform this action.');
        } else {
          console.error('🚨 API error:', error);
        }

        return throwError(() => error);
      })
    );
  }
}
