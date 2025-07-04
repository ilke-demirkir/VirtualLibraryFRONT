// src/app/checkout-success/checkout-success.component.ts
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/paymentService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  template: `
    <div class="success">
      <h2>🎉 Payment Successful!</h2>
      <p>Your order is confirmed and your cart has been cleared.</p>
      <a routerLink="/books/list" class="btn">Back to Catalog</a>
    </div>
  `,
  styles: [`
    .success { text-align: center; margin: 4rem 0; }
    .btn { display:inline-block; margin-top:1rem; padding:0.5rem 1rem; background:#4caf50; color:#fff; text-decoration:none; border-radius:4px; }
  `],
  imports: [RouterLink]
})
export class CheckoutSuccessComponent implements OnInit {
  constructor(private payment: PaymentService) {}

  ngOnInit() {
    // clear the client-side cart now that the backend has cleared it via callback
    this.payment.clearLocalCart();
  }
}
