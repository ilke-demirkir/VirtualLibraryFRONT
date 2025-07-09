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
  
  constructor(
    private svc: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}
  
  ngOnInit() {
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
  
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
  
  back() { this.router.navigate(['/orders']); }
}
