import { Component } from '@angular/core';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/bookService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-list-books',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-books.component.html',
  styleUrl: './list-books.component.scss'
})
export class ListBooksComponent {
  books:Book[] = [];
  filteredBooks: Book[] = [];
  searchTerm: string = '';
  isAdmin: boolean = false;

  constructor(private bookService: BookService, private router: Router) {}
  ngOnInit(): void {
    this.bookService.refreshBooks();
    this.bookService.books$.subscribe(books =>{
      this.books = this.bookService.getCurrentBooks();
      this.filterBooks();  
    });
   
  }
  filterBooks(): void {
    this.filteredBooks = this.books.filter(b =>
      b.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  editBook(id: number): void {
    this.router.navigate(['/books/edit', id]);
  }
  
}
