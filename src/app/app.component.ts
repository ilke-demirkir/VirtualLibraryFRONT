import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/authService';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "./components/toast/toast.component";
import { CartService } from './services/cartService';
import { OrderService } from './services/orderService';
import { Observable, BehaviorSubject } from 'rxjs';
import { OrderSummary } from './models/order.model';
import { OnInit, OnDestroy } from '@angular/core';
import { User } from './models/user.model';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { Router, NavigationError, Event as RouterEvent } from '@angular/router';
import { NetworkStatusService } from './services/network-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, ToastComponent,NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-route-test';
  orders$!: Observable<OrderSummary[]>;
  user$!: Observable<User | null>;
  private authSubscription?: Subscription;

  constructor(public auth:AuthService, public cartService:CartService, public orderService:OrderService, private router: Router, private networkStatus: NetworkStatusService){}

  ngOnInit() {
    // Create a BehaviorSubject to track user changes
    const userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = userSubject.asObservable();

    // Function to update user information
    const updateUserInfo = () => {
      if (this.auth.isLoggedIn()) {
        this.orders$ = this.orderService.list();
        this.auth.getCurrentUser().subscribe({
          next: (user) => userSubject.next(user),
          error: (err) => {
            console.error('Error fetching user:', err);
            userSubject.next(null);
          }
        });
      } else {
        userSubject.next(null);
        this.orders$ = new Observable<OrderSummary[]>(observer => observer.next([]));
      }
    };

    // Listen for authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      updateUserInfo();
    });

    // Initial update
    updateUserInfo();

    // Listen for network status changes
    this.networkStatus.isOnline$.subscribe(isOnline => {
      if (isOnline) {
        ToastComponent.show('You are back online!');
      } else {
        ToastComponent.show('You are offline. Some features may not work.');
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
