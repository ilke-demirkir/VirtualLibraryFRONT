import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cartService';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule }     from '@angular/common';
import { RouterModule }     from '@angular/router';
import { ToastComponent } from '../toast/toast.component';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls:   ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cart: CartService, public auth: AuthService) {}

  ngOnInit() {
    this.cart.cart$.subscribe(items => {this.cartItems = items; });
    if (this.auth.isLoggedIn()) {
      this.cart.loadCart().subscribe();
    }
  }

  inc(item: CartItem) {
    this.cart.updateQuantity(item.id, item.quantity + 1).subscribe({
      error: () => ToastComponent.show('Failed to update item quantity.')
    });
  }

  dec(item: CartItem) {
    if (item.quantity > 1) {
      this.cart.updateQuantity(item.id, item.quantity - 1).subscribe({
        error: () => ToastComponent.show('Failed to update item quantity.')
      });
    } else {
      this.cart.removeFromCart(item.id).subscribe({
        next: () => ToastComponent.show(`Removed "${item.bookName}" from cart`),
        error: () => ToastComponent.show('Failed to remove item from cart.')
      });
    }
  }

  remove(item: CartItem) {
    this.cart.removeFromCart(item.id).subscribe({
      next: () => ToastComponent.show(`Removed "${item.bookName}" from cart`),
      error: () => ToastComponent.show('Failed to remove item from cart.')
    });
  }

  get subtotal() {
    return this.cartItems
      .reduce((sum, ci) => sum + ci.bookPrice * ci.quantity, 0);
  }
  
  
}


