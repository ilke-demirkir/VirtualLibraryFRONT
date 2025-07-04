import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { CartService } from '../../services/cartService';
import { ToastComponent } from '../toast/toast.component';
import { AuthService } from '../../services/authService';
import { BookImportService } from '../../services/book-importService';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-list-books',
  standalone: true,
  templateUrl: './list-books.component.html',
  styleUrls: ['./list-books.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule, ToastComponent, ScrollingModule],
})
export class ListBooksComponent implements OnInit {
  books: Book[]       = [];
  searchTerm = '';

  // for filteration
  authors: string[] = [];
  categories: string[] = [];
  years: number[] = [];
  featured = false; // toggle for featured books
  selectedAuthors = new Set<string>();
  selectedCategories = new Set<string>();
  selectedYears = new Set<number>();

  // static facets
  allBooksForFacets: Book[] = [];

  // paging
  page       = 1;
  pageSize   = 12;
  totalCount = 0;
  loading    = false;
  titleQuery = '';

  constructor(
    private api: BookService,
    private cartService: CartService,
    public auth: AuthService,
    private bookImport: BookImportService, // Assuming BookService has import functionality
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read category from query params
    this.route.queryParamMap.subscribe(params => {
      const category = params.get('category');
      if (category && !this.selectedCategories.has(category)) {
        this.selectedCategories.clear();
        this.selectedCategories.add(category);
      }
      // Fetch all books for static facets
      this.api.getAllBooks('', 1, 10000, [],[],[], false).subscribe({
        next: (resp: {items: Book[], totalCount: number}) => {
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

  private initializeStaticFacets(): void {
    this.authors    = Array.from(new Set(this.allBooksForFacets.map(b => b.author    || '—'))).sort();
    this.categories = Array.from(new Set(this.allBooksForFacets.map(b => b.category  || '—'))).sort();
    this.years      = Array.from(new Set(this.allBooksForFacets.map(b => b.year))).sort((a,b)=>b-a);
  }

  /** Called when user types or clears the search box */
  updateSearch(term: string): void {
    this.searchTerm = term.trim();
    this.resetAndLoad();
  }

  /** Clear out and load page 1 */
  private resetAndLoad(): void {
    this.page       = 1;
    this.books      = [];
    this.totalCount = 0;
    this.loadPage();
  }

  /** Fetch one page of books */
  loadPage(): void {
    if (this.loading) return;
    this.loading = true;

    this.api
      .getAllBooks(this.searchTerm, this.page, this.pageSize, Array.from(this.selectedAuthors), Array.from(this.selectedCategories), Array.from(this.selectedYears), this.featured)
      .subscribe({
        next: (resp: {items: Book[], totalCount: number}) => {
          this.books = [...this.books, ...resp.items];
          this.totalCount = resp.totalCount;
          this.page++;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
        }
      });
  }

  /** bound to (scrolled) from infiniteScroll */
  onScroll(index: number): void {
    // Load more when the user is within 5 items of the end
    if (this.books.length < this.totalCount && index > this.books.length - 6) {
      this.loadPage();
    }
  }

  toggleAuthor(author: string): void {
    this._toggle(this.selectedAuthors, author);
    this.resetAndLoad();
  }
  toggleCategory(category: string): void {
    this._toggle(this.selectedCategories, category);
    this.resetAndLoad();
  }
  toggleYear(year: number): void {
    this._toggle(this.selectedYears, year);
    this.resetAndLoad();
  }

  private _toggle<T>(set: Set<T>, item: T): void {
    set.has(item) ? set.delete(item) : set.add(item);
  }

  /** Track by function for ngFor performance */
  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  addToCart(id: number): void {
    this.cartService.addToCart(id);
    this.cartService.loadCart().subscribe(() => {
      ToastComponent.show('Book added to cart!');
    });
  }

  toggleFavorite(id: number): void {
    this.api.toggleFavorite(id);   // or call your BookService for that
  }

  onImport(){
    this.bookImport.importByTitle(this.titleQuery).subscribe({
      next: (data: any) => {
        this.resetAndLoad(); // Refresh the book list
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
} 