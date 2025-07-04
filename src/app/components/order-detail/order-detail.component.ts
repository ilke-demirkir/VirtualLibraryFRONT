// src/app/orders/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/orderService';
import { OrderDetail }from '../../models/order.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  templateUrl: './order-detail.component.html',
  imports: [CommonModule],
})
export class OrderDetailComponent implements OnInit {
  order?: OrderDetail;
  constructor(
    private svc: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.svc.get(id).subscribe(dto => this.order = dto);
  }
  back() { this.router.navigate(['/orders']); }
}
