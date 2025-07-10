import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';
import { AuthService } from './authService';

@Injectable({ providedIn: 'root' })
export class CartService implements OnDestroy {
  private apiUrl = 'https://localhost:5038/api/cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
  private authSubscription?: Subscription;

  total$:Observable<number> = this.cart$.pipe(
    map(items => items.reduce((sum, ci) => sum + (ci.bookPrice ?? 0) * ci.quantity, 0))
  );
  
  refreshCart(){
    this.loadCart().subscribe();
  }

  constructor(private http: HttpClient, private auth: AuthService) {
    // Listen to authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.refreshCart();
      } else {
        // Clear cart data when user logs out
        this.cartSubject.next([]);
      }
    });

    // Initial load if already logged in
    if (this.auth.isLoggedIn()) {
      this.refreshCart();
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Clear cart data (called when user switches)
  clearCartData() {
    this.cartSubject.next([]);
  }
 
  // initial load or reload
  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(items => this.cartSubject.next(items))
    );
  }

  // add new or increment existing
  addToCart(bookId: number, qty = 1) {
    return this.http.post(this.apiUrl, { bookId, quantity: qty })
      .pipe(switchMap(() => this.loadCart()));
  }
  updateQuantity(id: number, qty: number) {
    return this.http.patch(`${this.apiUrl}/${id}`, { quantity: qty })
      .pipe(switchMap(() => this.loadCart()));
  }
  
  removeFromCart(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(switchMap(() => this.loadCart()));
  }
  getTotal(): number {
    return this.cartSubject.value.reduce(
      (sum, ci) => sum + (ci.bookPrice ?? 0) * ci.quantity,
      0
    );
  }

  clearCart() {
    return this.http.post<void>(`${this.apiUrl}/checkout`, {});
  }
}
