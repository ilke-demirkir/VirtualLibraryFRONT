import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterModule }               from '@angular/router';
import { map }                        from 'rxjs/operators';
import { BookService }              from '../../services/bookService';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Book } from '../../models/book.model';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites$!: Observable<Book[]>;
  private authSubscription?: Subscription;
  private favoritesSubject = new BehaviorSubject<Book[]>([]);

  constructor(
    private bookService: BookService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Listen to authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadFavorites();
      } else {
        // Clear favorites when user logs out
        this.favoritesSubject.next([]);
      }
    });

    // Initial load if already logged in
    if (this.auth.isLoggedIn()) {
      this.loadFavorites();
    } else {
      this.favorites$ = this.favoritesSubject.asObservable();
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private loadFavorites() {
    // ensure we've loaded the latest book list
    this.bookService.refreshBooks();
    this.favorites$ = this.bookService.books$.pipe(
      map(books => books.filter(b => b.fav))
    );
  }

  removeFromFav(id: number) {
    this.bookService.toggleFavorite(id);
  }
}
