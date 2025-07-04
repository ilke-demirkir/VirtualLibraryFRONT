import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/authService';
import { CartService } from '../../services/cartService';
import { ToastComponent } from '../toast/toast.component';
import { ReviewService } from '../../services/reviewService';
import { Review, CreateReview } from '../../models/review.model';
import { FormsModule } from '@angular/forms';
import { StarDisplayComponent } from '../star-display/star-display.component';
import { StarInputComponent } from '../star-input/star-input.component';
import { switchMap, tap } from 'rxjs/operators';



@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule, StarDisplayComponent,StarInputComponent],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  book!: Book;
  private sub!: Subscription;
  showReviewForm = false;
  newReview:CreateReview = { rating: 0, comment: '' };
  reviews: Review[] = [];
  currentUserId = 0; // should be set to the logged-in user's ID
  isAdmin = false; 

  constructor(private route: ActivatedRoute, private bookService: BookService, private router:Router, public auth:AuthService, private cartService:CartService, private rs:ReviewService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.sub = this.bookService.books$.subscribe(books => {
      const found = books.find(b => b.id === id);
      this.book = found ?? { id: -1, name: 'Unknown', year: 0, fav: false };
      this.isAdmin = this.auth.isAdmin();
      this.currentUserId = this.auth.getUserId() || 0; // Get current user ID from auth service
      this.loadReviews(id);
  });
}
  toggleFavorite(): void {
    if (!this.book) {
      console.error('Book not found');
      this.router.navigate(['/books/list']);
      return;
    }
    this.bookService.toggleFavorite(this.book.id);
  
  }
  addToCart(id:number): void {
    this.cartService.addToCart(id);
    this.cartService.loadCart().subscribe(() => {
      ToastComponent.show(`Book added to cart!`);
    });
  }
  loadReviews(bookId: number) {
    this.rs.list(bookId).subscribe(list => this.reviews = list);
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  // book-detail.component.ts
  submitReview() {
    this.rs.create(this.book.id, this.newReview).subscribe(res => {
      // append the new review
      this.reviews = res.review
        ? [ ...this.reviews, res.review ]
        : this.reviews;
      // update the average straight from the back end
      this.book.averageRating = res.averageRating;
      this.newReview = { rating: 0, comment: '' };
      this.showReviewForm = false;
    });
  }

  deleteReview(id: number) {
    this.rs.delete(this.book.id, id).subscribe(res => {
      // filter out the deleted one
      this.reviews = this.reviews.filter(r => r.id !== id);
      this.book.averageRating = res.averageRating;
    });
  }


}
