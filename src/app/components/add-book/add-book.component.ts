import { Component } from '@angular/core';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import {FormsModule} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-book',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent {
  book: Book = { id:0, name: '', year: new Date().getFullYear(), fav: false };
  constructor(private bookService: BookService) {}
  onRawSubmit(event:Event){
    event.preventDefault(); // Prevent default form submission
    console.log('Raw submit event:', event);
  }
  submitBook(){
    console.log('Submitting book:', this.book);
    this.bookService.addBook(this.book).subscribe({
      next: (data) => {
        console.log('Book added successfully:', data);
        this.book = { id: 0, name: '', year: new Date().getFullYear(), fav: false }; // Reset form
      },
      error: (error) => {
        console.error('Error adding book:', error);
      }
  })
  }
}