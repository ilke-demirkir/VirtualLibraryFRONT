import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cartService';
import { ToastComponent } from '../toast/toast.component';
import { AuthService } from '../../services/authService';
import { BookImportService } from '../../services/book-importService';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

// Enhanced filter interface
interface FilterState {
  searchTerm: string;
  selectedAuthors: Set<string>;
  selectedCategories: Set<string>;
  selectedYears: Set<number>;
  priceRange: { min: number | null; max: number | null };
  ratingRange: { min: number | null; max: number | null };
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  featured: boolean;
  sortBy: 'name' | 'price' | 'rating' | 'year' | 'author';
  sortOrder: 'asc' | 'desc';
  discountOnly: boolean;
  bestsellerOnly: boolean;
}

@Component({
  selector: 'app-list-books',
  standalone: true,
  templateUrl: './list-books.component.html',
  styleUrls: ['./list-books.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule, ToastComponent],
})
export class ListBooksComponent implements OnInit, OnDestroy {
  @ViewChild('bookGrid', { static: false }) bookGrid!: ElementRef;
  
  books: Book[] = [];
  
  // Enhanced filtering properties
  filterState: FilterState = {
    searchTerm: '',
    selectedAuthors: new Set<string>(),
    selectedCategories: new Set<string>(),
    selectedYears: new Set<number>(),
    priceRange: { min: null, max: null },
    ratingRange: { min: null, max: null },
    stockFilter: 'all',
    featured: false,
    sortBy: 'name',
    sortOrder: 'asc',
    discountOnly: false,
    bestsellerOnly: false
  };

  // Filter options
  authors: string[] = [];
  categories: string[] = [];
  years: number[] = [];
  priceRanges: { min: number; max: number } = { min: 0, max: 0 };
  ratingRanges: { min: number; max: number } = { min: 0, max: 5 };

  // UI state
  showFilters = false;
  activeFiltersCount = 0;
  loading = false;
  totalCount = 0;
  page = 1;
  pageSize = 12;
  hasMoreBooks = true; // New property for infinite scroll

  // Debounced search
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Static facets
  allBooksForFacets: Book[] = [];

  constructor(
    private api: BookService,
    private cartService: CartService,
    public auth: AuthService,
    private bookImport: BookImportService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Setup debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterState.searchTerm = term;
      this.resetAndLoad();
    });
  }

  ngOnInit(): void {
    // Read category from query params
    this.route.queryParamMap.subscribe(params => {
      const category = params.get('category');
      if (category && !this.filterState.selectedCategories.has(category)) {
        this.filterState.selectedCategories.clear();
        this.filterState.selectedCategories.add(category);
      }
      
      // Fetch all books for static facets
      this.api.getAllBooks('', 1, 10000, [], [], [], false).subscribe({
        next: (resp: { items: Book[], totalCount: number }) => {
          this.allBooksForFacets = resp.items;
          this.initializeStaticFacets();
        },
        error: err => {}
      });
      
      this.api.books$.subscribe(books => {
        this.books = books;
        this.initializeStaticFacets();
      });
      
      this.resetAndLoad();
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private initializeStaticFacets(): void {
    this.authors = Array.from(new Set(this.allBooksForFacets.map(b => b.author || '—'))).sort();
    this.categories = Array.from(new Set(this.allBooksForFacets.map(b => b.category || '—'))).sort();
    this.years = Array.from(new Set(this.allBooksForFacets.map(b => b.year))).sort((a, b) => b - a);
    
    // Calculate price and rating ranges
    const prices = this.allBooksForFacets.map(b => b.price).filter(p => p != null) as number[];
    const ratings = this.allBooksForFacets.map(b => b.averageRating).filter(r => r != null) as number[];
    
    if (prices.length > 0) {
      this.priceRanges = { min: Math.min(...prices), max: Math.max(...prices) };
    }
    if (ratings.length > 0) {
      this.ratingRanges = { min: Math.min(...ratings), max: Math.max(...ratings) };
    }
  }

  // Enhanced search with debouncing
  updateSearch(term: string): void {
    this.searchSubject.next(term.trim());
  }

  // Filter toggle methods
  toggleAuthor(author: string): void {
    this._toggle(this.filterState.selectedAuthors, author);
    this.resetAndLoad();
  }

  toggleCategory(category: string): void {
    this._toggle(this.filterState.selectedCategories, category);
    this.resetAndLoad();
  }

  toggleYear(year: number): void {
    this._toggle(this.filterState.selectedYears, year);
    this.resetAndLoad();
  }

  // New filter methods
  updatePriceRange(min: number | null, max: number | null): void {
    this.filterState.priceRange = { min, max };
    this.resetAndLoad();
  }

  updateRatingRange(min: number | null, max: number | null): void {
    this.filterState.ratingRange = { min, max };
    this.resetAndLoad();
  }

  updateStockFilter(filter: 'all' | 'in-stock' | 'out-of-stock'): void {
    this.filterState.stockFilter = filter;
    this.resetAndLoad();
  }

  toggleFeatured(): void {
    this.filterState.featured = !this.filterState.featured;
    this.resetAndLoad();
  }

  updateSorting(sortBy: 'name' | 'price' | 'rating' | 'year' | 'author', order: 'asc' | 'desc'): void {
    this.filterState.sortBy = sortBy;
    this.filterState.sortOrder = order;
    this.resetAndLoad();
  }

  toggleDiscountOnly(): void {
    this.filterState.discountOnly = !this.filterState.discountOnly;
    this.resetAndLoad();
  }

  toggleBestsellerOnly(): void {
    this.filterState.bestsellerOnly = !this.filterState.bestsellerOnly;
    this.resetAndLoad();
  }

  // Clear all filters
  clearAllFilters(): void {
    this.filterState = {
      searchTerm: '',
      selectedAuthors: new Set<string>(),
      selectedCategories: new Set<string>(),
      selectedYears: new Set<number>(),
      priceRange: { min: null, max: null },
      ratingRange: { min: null, max: null },
      stockFilter: 'all',
      featured: false,
      sortBy: 'name',
      sortOrder: 'asc',
      discountOnly: false,
      bestsellerOnly: false
    };
    this.resetAndLoad();
  }

  // Get active filters count
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filterState.searchTerm) count++;
    if (this.filterState.selectedAuthors.size > 0) count++;
    if (this.filterState.selectedCategories.size > 0) count++;
    if (this.filterState.selectedYears.size > 0) count++;
    if (this.filterState.priceRange.min !== null || this.filterState.priceRange.max !== null) count++;
    if (this.filterState.ratingRange.min !== null || this.filterState.ratingRange.max !== null) count++;
    if (this.filterState.stockFilter !== 'all') count++;
    if (this.filterState.featured) count++;
    if (this.filterState.discountOnly) count++;
    if (this.filterState.bestsellerOnly) count++;
    return count;
  }

  // Toggle filter panel
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  private _toggle<T>(set: Set<T>, item: T): void {
    set.has(item) ? set.delete(item) : set.add(item);
  }

  /** Clear out and load page 1 */
  resetAndLoad(): void {
    this.page = 1;
    this.books = [];
    this.totalCount = 0;
    this.hasMoreBooks = true;
    this.activeFiltersCount = this.getActiveFiltersCount();
    // Reset bestsellers cache if filter changes
    this._allBestsellers = null;
    this._bestsellerPage = 1;
    this.loadPage();
  }

  /** Fetch one page of books with enhanced filtering */
  loadPage(): void {
    if (this.loading || !this.hasMoreBooks) return;
    this.loading = true;

    // Convert filter state to API parameters
    const authors = Array.from(this.filterState.selectedAuthors);
    const categories = Array.from(this.filterState.selectedCategories);
    const years = Array.from(this.filterState.selectedYears);

    // If bestsellerOnly is selected, fetch all books and filter client-side
    if (this.filterState.bestsellerOnly) {
      // Only fetch all books once
      if (!this._allBestsellers) {
        this.api.getAllBooks(
          this.filterState.searchTerm,
          1,
          10000, // Large number to get all
          authors,
          categories,
          years,
          this.filterState.featured
        ).subscribe({
          next: (resp: { items: Book[], totalCount: number }) => {
            // Filter for bestsellers
            this._allBestsellers = resp.items.filter(b => b.isBestseller);
            this._bestsellerPage = 1;
            this._appendBestsellerPage();
            this.loading = false;
          },
          error: err => {
            this.loading = false;
          }
        });
      } else {
        this._appendBestsellerPage();
        this.loading = false;
      }
      return;
    }

    // Normal paged API for other filters
    this.api
      .getAllBooks(
        this.filterState.searchTerm,
        this.page,
        this.pageSize,
        authors,
        categories,
        years,
        this.filterState.featured
      )
      .subscribe({
        next: (resp: { items: Book[], totalCount: number }) => {
          let filteredBooks = resp.items;
          // Apply additional client-side filters (except bestseller)
          filteredBooks = this.applyClientSideFilters(filteredBooks, false);
          filteredBooks = this.applySorting(filteredBooks);
          this.books = [...this.books, ...filteredBooks];
          this.totalCount = resp.totalCount;
          this.hasMoreBooks = this.books.length < this.totalCount;
          this.page++;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
        }
      });
  }

  // Helper for paginating bestsellers client-side
  private _allBestsellers: Book[] | null = null;
  private _bestsellerPage = 1;
  private _appendBestsellerPage(): void {
    if (!this._allBestsellers) return;
    const start = (this._bestsellerPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageBooks = this.applySorting(this._allBestsellers.slice(start, end));
    this.books = [...this.books, ...pageBooks];
    this.totalCount = this._allBestsellers.length;
    this.hasMoreBooks = this.books.length < this.totalCount;
    this._bestsellerPage++;
  }

  // Enhanced client-side filters: skip bestseller filter if not needed
  private applyClientSideFilters(books: Book[], includeBestseller = true): Book[] {
    return books.filter(book => {
      // Price range filter
      if (this.filterState.priceRange.min !== null && book.price && book.price < this.filterState.priceRange.min) return false;
      if (this.filterState.priceRange.max !== null && book.price && book.price > this.filterState.priceRange.max) return false;
      // Rating range filter
      if (this.filterState.ratingRange.min !== null && book.averageRating && book.averageRating < this.filterState.ratingRange.min) return false;
      if (this.filterState.ratingRange.max !== null && book.averageRating && book.averageRating > this.filterState.ratingRange.max) return false;
      // Stock filter
      if (this.filterState.stockFilter === 'in-stock' && (!book.stock || book.stock === 0)) return false;
      if (this.filterState.stockFilter === 'out-of-stock' && book.stock && book.stock > 0) return false;
      // Discount only filter
      if (this.filterState.discountOnly && !book.discount) return false;
      // Bestseller only filter (skip if not needed)
      if (includeBestseller && this.filterState.bestsellerOnly && !book.isBestseller) return false;
      return true;
    });
  }

  private applySorting(books: Book[]): Book[] {
    return books.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.filterState.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'author':
          aValue = (a.author || '').toLowerCase();
          bValue = (b.author || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (this.filterState.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  /** Track by function for ngFor performance */
  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  addToCart(id: number): void {
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
        console.error('Add to cart failed:', err);
      }
    });
  }

  toggleFavorite(id: number): void {
    this.api.toggleFavorite(id);
  }

  onImport() {
    this.bookImport.importByTitle(this.filterState.searchTerm).subscribe({
      next: (data: any) => {
        this.resetAndLoad();
        ToastComponent.show('Books imported successfully!');
      },
      error: (error: any) => {
        ToastComponent.show('Failed to import books.');
      }
    });
  }

  get bookRows(): Book[][] {
    const perRow = 4;
    const rows: Book[][] = [];
    for (let i = 0; i < this.books.length; i += perRow) {
      rows.push(this.books.slice(i, i + perRow));
    }
    return rows;
  }

  // Infinite scroll handler
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Load more when user is within 100px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.loadPage();
    }
  }
} 