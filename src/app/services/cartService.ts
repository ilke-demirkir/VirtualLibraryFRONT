import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'https://localhost:5038/api/cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  total$:Observable<number> = this.cart$.pipe(
    map(items => items.reduce((sum, ci) => sum + (ci.bookPrice ?? 0) * ci.quantity, 0))
  );
  
  refreshCart(){
    this.loadCart().subscribe();
  }
  constructor(private http: HttpClient) {
    this.refreshCart();
  }
 
  // initial load or reload
  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(items => this.cartSubject.next(items))
    );
  }

  // add new or increment existing
  addToCart(bookId: number, qty = 1): void {
    this.http.post(this.apiUrl, { bookId, quantity: qty })
      .pipe(switchMap(() => this.loadCart()))
      .subscribe();   // loadCart() itself calls tap(...) to overwrite the subject
  }  
  updateQuantity(id: number, qty: number) {
    this.http.patch(`${this.apiUrl}/${id}`, { quantity: qty })
      .pipe(switchMap(() => this.loadCart()))
      .subscribe();
  }
  
  removeFromCart(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(switchMap(() => this.loadCart()))
      .subscribe();
  }
  getTotal(): number {
    return this.cartSubject.value.reduce(
      (sum, ci) => sum + (ci.bookPrice ?? 0) * ci.quantity,
      0
    );
  }

  clearCart(): void {
    this.http.post<void>(`${this.apiUrl}/checkout`, {}).subscribe(() => {
      this.cartSubject.next([]);
    });
  }
}
