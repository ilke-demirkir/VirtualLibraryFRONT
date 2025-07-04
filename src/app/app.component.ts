import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/authService';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "./components/toast/toast.component";
import { CartService } from './services/cartService';
import { OrderService } from './services/orderService';
import { Observable } from 'rxjs';
import { OrderSummary } from './models/order.model';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'angular-route-test';
  orders$!: Observable<OrderSummary[]>;
  constructor(public auth:AuthService, public cartService:CartService, public orderService:OrderService){}

  ngOnInit() {
    if(this.auth.isLoggedIn()) {
      this.orders$ = this.orderService.list();
    }
  }
}
