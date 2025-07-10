// src/app/orders/order-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orderService';
import { OrderDetail }from '../../models/order.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  imports: [CommonModule],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order?: OrderDetail;
  loading = true;
  error = '';
  private sub?: Subscription;
  private authSubscription?: Subscription;
  
  constructor(
    private svc: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}
  
  ngOnInit() {
    // Listen to authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadOrderDetail();
      } else {
        // Clear order details when user logs out
        this.order = undefined;
        this.loading = false;
        this.error = '';
      }
    });

    // Initial load if already logged in
    if (this.auth.isLoggedIn()) {
      this.loadOrderDetail();
    } else {
      this.loading = false;
    }
  }
  
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }

  private loadOrderDetail() {
    // Check if user is authenticated before making API calls
    if (!this.auth.isLoggedIn()) {
      this.loading = false;
      return;
    }

    const id = +this.route.snapshot.params['id'];
    this.sub = this.svc.get(id).subscribe({
      next: dto => {
        this.order = dto;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load order details.';
        this.loading = false;
        ToastComponent.show('Failed to load order details.');
      }
    });
  }
  
  back() { this.router.navigate(['/orders']); }
}
