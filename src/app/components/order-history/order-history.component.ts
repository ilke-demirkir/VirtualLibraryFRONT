// src/app/orders/order-history.component.ts
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/orderService';
import { OrderSummary } from '../../models/order.model';
import { RouterLink }        from '@angular/router';
import { CommonModule }      from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit {
  loading = false;
  error = '';
  
  orders: OrderSummary[] = [];
  constructor(private svc: OrderService, private router: Router) {}
  ngOnInit() {
    this.svc.list().subscribe(list => this.orders = list);
  }
  view(id: number) {
    this.router.navigate(['/orders', id]);
  }
}
