import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { WishlistService } from '../../services/wishlistService';
import { WishlistItem } from '../../models/wishlist.model';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule, StarDisplayComponent,StarInputComponent],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit, OnDestroy {
  book!: Book;
  private sub!: Subscription;
  showReviewForm = false;
  newReview:CreateReview = { rating: 0, comment: '' };
  reviews: Review[] = [];
  currentUserId = 0; // should be set to the logged-in user's ID
  isAdmin = false; 
  wishlist$!:Observable<WishlistItem[]>;
  isInWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    // Initialize wishlist$ with empty array so buttons show up
    this.wishlist$ = this.wishlistService.items$;
    
    // Subscribe to wishlist changes to update isInWishlist
    this.wishlist$.subscribe(items => {
      if (items && this.auth.isLoggedIn()) {
        this.isInWishlist = items.some(w => w.bookId === this.bookId);
      } else {
        this.isInWishlist = false;
      }
    });
    
    this.sub = this.bookService.books$.subscribe(books => {
      const found = books.find(b => b.id === id);
      this.book = found ?? { id: -1, name: 'Unknown', year: 0, fav: false };
      this.isAdmin = this.auth.isAdmin();
      this.currentUserId = this.auth.getUserId() || 0; // Get current user ID from auth service
      
      // Only load reviews and wishlist if user is authenticated
      if (this.auth.isLoggedIn()) {
        this.loadReviews(id);
        this.wishlistService.refreshWishlist();
      }
  });
}

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  
  toggleFavorite(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.book) {
      console.error('Book not found');
      this.router.navigate(['/books/list']);
      return;
    }
    this.bookService.toggleFavorite(this.book.id);
  }
  
  addToCart(id:number): void {
    if (!this.auth.isLoggedIn()) {
      ToastComponent.show('Please log in to add items to cart');
      this.router.navigate(['/login']);
      return;
    }
    
    this.cartService.addToCart(id).subscribe({
      next: () => {
        ToastComponent.show('Book added to cart!');
      },
      error: (err) => {
        // Let the interceptor handle the toast
        console.error('Add to cart failed:', err);
      }
    });
  }

  // BOOK REVIEW LOGIC 
  
  loadReviews(bookId: number) {
    this.reviewService.list(bookId).subscribe(list => this.reviews = list);
  }

  toggleReviewForm() {
    if (!this.auth.isLoggedIn()) {
      ToastComponent.show('Please log in to add reviews');
      this.router.navigate(['/login']);
      return;
    }
    this.showReviewForm = !this.showReviewForm;
  }

  submitReview() {
    this.reviewService.create(this.book.id, this.newReview).subscribe(res => {
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
    this.reviewService.delete(this.book.id, id).subscribe(res => {
      // filter out the deleted one
      this.reviews = this.reviews.filter(r => r.id !== id);
      this.book.averageRating = res.averageRating;
    });
  }

  // WISHLIST LOGIC

  get bookId(){
    return +this.route.snapshot.paramMap.get('id')!;
  }

  addToWishList(){
    if (!this.auth.isLoggedIn()) {
      console.log('🔒 Authentication required: User tried to add to wishlist');
      ToastComponent.show('Please log in to add items to wishlist');
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.add(this.bookId).subscribe();
  }

  removeFromWishlist(){
    if (!this.auth.isLoggedIn()) {
      ToastComponent.show('Please log in to manage your wishlist');
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.remove(this.bookId).subscribe();
  }
}
