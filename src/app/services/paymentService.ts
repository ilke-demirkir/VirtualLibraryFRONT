// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cartService';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // point this at your İyzico controller
  private apiUrl = 'https://localhost:5038/api/iyzi';

  constructor(
    private http: HttpClient,
    private cart: CartService
  ) {}

  /**
   * 1) Calls POST /api/iyzi/create with the callback URL
   * 2) Returns an Observable<string> of the HTML form
   */
  createForm(): Observable<string> {
    const callback = `${this.apiUrl}/callback`;
    return this.http
      .post<{ htmlForm: string }>(
        `${this.apiUrl}/create`,
        { callbackUrl: callback }      // <-- send an object
      )
      .pipe(map(res => res.htmlForm));
  }

  /**
   *  After Iyzico POST-backs to /api/iyzi/callback, your controller
   *  will clear the cart & decrement stock. We don't need another
   *  front-end call here unless you want to refresh local state.
   */
  clearLocalCart() {
    this.cart.clearCart();
  }
}
