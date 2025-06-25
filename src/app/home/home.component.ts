import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BookService } from '../services/bookService';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  isVisible:boolean = false;
  books$!: Observable<Book[]>;


  constructor(private router:Router) {console.log("HomeComponent constructor called");}
  private bookService = inject(BookService);

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
  }

  }