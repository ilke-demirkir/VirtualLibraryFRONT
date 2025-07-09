import { ErrorHandler, Injectable } from '@angular/core';
import { ToastComponent } from './toast/toast.component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    ToastComponent.show('An unexpected error occurred. Please try again.');
    // Optionally log the error to a remote service here
    console.error('Global error:', error);
  }
} 