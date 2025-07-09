import { Component } from '@angular/core';
import { WishlistService } from '../../services/wishlistService';
import { Router } from '@angular/router';
import { WishlistItem } from '../../models/wishlist.model';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cartService';
@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  imports: [CommonModule]
})
export class WishlistComponent {
  constructor(
    public wishlistService: WishlistService,
    private router: Router,
    private bookService: BookService,
    private cartService: CartService
  ) {}

  removeFromWishlist(item: WishlistItem) {
    this.wishlistService.remove(item.bookId).subscribe({
      next: () => {
        ToastComponent.show('Book removed from wishlist!');
        this.wishlistService.refreshWishlist();
      },
      error: () => ToastComponent.show('Failed to remove book from wishlist.')
    });
  }
  browseBooks() {
    this.router.navigate(['/books/list']);
  }

  getBookById(bookId: number): Book | undefined {
    return this.bookService.getBookById(bookId);
  }

  viewDetails(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  addToCart(bookId: number) {
    this.cartService.addToCart(bookId).subscribe({
      next: () => ToastComponent.show('Book added to cart!'),
      error: () => ToastComponent.show('Failed to add book to cart.')
    });
  }
}
