// src/app/orders/order-history.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/orderService';
import { OrderSummary } from '../../models/order.model';
import { RouterLink }        from '@angular/router';
import { CommonModule }      from '@angular/common';
import { Router } from '@angular/router';
import { ToastComponent } from '../toast/toast.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  
  orders: OrderSummary[] = [];
  private sub?: Subscription;
  
  constructor(private svc: OrderService, private router: Router, private auth: AuthService) {}
  
  ngOnInit() {
    // Check if user is authenticated before making API calls
    if (!this.auth.isLoggedIn()) {
      this.loading = false;
      return;
    }

    this.sub = this.svc.list().subscribe({
      next: list => {
        this.orders = list.sort((a, b) => a.id - b.id); // Sort in ascending order by ID
      },
      error: err => {
        this.error = 'Failed to load order history.';
        ToastComponent.show('Failed to load order history.');
      }
    });
  }
  
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
  
  view(id: number) {
    this.router.navigate(['/orders', id]);
  }
}
