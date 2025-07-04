import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BookService } from '../services/bookService';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { ListBooksComponent } from '../components/list-books/list-books.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ListBooksComponent,RouterLink],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isVisible:boolean = false;
  books$!: Observable<Book[]>;
  featuredBooks: Book[] = [];
  @ViewChild('featuredScroller', { static: false }) featuredScroller!: ElementRef<HTMLDivElement>;
  private scrollInterval: any;
  private isHovered = false;

  constructor(private router:Router, private bookService: BookService) {console.log("HomeComponent constructor called");}

  goToChild(book: Book) {
    try {
      if (!book?.id) throw new Error('book.id is invalid');
      this.router.navigate(['/child', book.id], { state: { book } });
      console.log('➡️ Navigated to child:', book.id);
    } catch (err) {
      console.error('🚨 goToChild error:', err);
    }
  }
  
  toggleFavorite(book: Book) {
    try {
      if (!book) throw new Error('book is null or undefined');
      book.fav = !book.fav;
      console.log(`⭐ Toggled fav for book ID ${book.id}:`, book.fav);
    } catch (err) {
      console.error('🚨 toggleFavorite error:', err);
    }
  }
  
  
  
  onAddBook(newBook: Book) {
    try {
      this.bookService.addBook(newBook).subscribe({
        next: () => {
          console.log('📚 Book added:', newBook);
          this.bookService.refreshBooks();
        },
        error: (err) => {
          console.error('🚨 onAddBook HTTP error:', err);
        }
      });
    } catch (err) {
      console.error('🚨 onAddBook setup error:', err);
    }
  }

  ngOnInit(): void {
    try{
      this.books$ = this.bookService.books$;
    } catch(err){
      console.error('🚨 ngOnInit error:', err);
    }
    this.bookService.refreshBooks();
    this.bookService.getAllBooks('', 1, 12, [], [], [], true).subscribe(resp => {
      this.featuredBooks = resp.items;
    });
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  startAutoScroll() {
    this.scrollInterval = setInterval(() => {
      if (this.featuredScroller && !this.isHovered) {
        const el = this.featuredScroller.nativeElement;
        const singleSetWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= singleSetWidth) {
          el.scrollLeft -= singleSetWidth;
        } else {
          el.scrollLeft += 1;
        }
      }
    }, 20); // Lower = faster
  }

  onScrollerEnter() {
    this.isHovered = true;
  }
  onScrollerLeave() {
    this.isHovered = false;
  }

  ngOnDestroy(): void {
    if (this.scrollInterval) clearInterval(this.scrollInterval);
  }
}