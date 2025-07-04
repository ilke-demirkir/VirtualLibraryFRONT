import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cartService';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule }     from '@angular/common';
import { RouterModule }     from '@angular/router';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls:   ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cart: CartService) {}

  ngOnInit() {
    this.cart.cart$.subscribe(items => {this.cartItems = items; });
    this.cart.loadCart().subscribe();
  }

  inc(item: CartItem) {
    this.cart.updateQuantity(item.id, item.quantity + 1);
  }

  dec(item: CartItem) {
    if (item.quantity > 1) {
      this.cart.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.cart.removeFromCart(item.id);
      ToastComponent.show(`Item removed from cart`, item);
    }
  }

  remove(item: CartItem) {
    this.cart.removeFromCart(item.id);
  }

  get subtotal() {
    return this.cartItems
      .reduce((sum, ci) => sum + ci.bookPrice * ci.quantity, 0);
  }
  
  
}


