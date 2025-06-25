import { Component } from '@angular/core';
import { Book } from '../../models/book.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/bookService';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-book',
  imports: [CommonModule,FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.scss']
})
export class EditBookComponent implements OnInit {
  book:Book = { id: 0, name: '', year: new Date().getFullYear(), fav: false };
  constructor(private route:ActivatedRoute, private bookService:BookService, private router:Router) {}

  ngOnInit(): void {
    this.bookService.refreshBooks();
    const bookId = this.route.snapshot.paramMap.get('id');
    const found = this.bookService.getBookById(Number(bookId));
    if (found) {
      this.book = this.bookService.getBookById(Number(bookId)) || this.book;
    }
    else{
      alert('Book not found');
    }
  }
  save(): void {
    this.bookService.updateBook(this.book).subscribe({
      next: () => {
        console.log('Book updated successfully');
        this.router.navigate(['/books/list']);
      },
      error: (error) => {
        console.error('Error updating book:', error);
      }
    })
  }
}
