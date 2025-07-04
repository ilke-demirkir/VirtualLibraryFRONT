import { Component } from '@angular/core';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    ToastComponent
  ],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent {
  book: Book = {
    id: 0,
    name: '',
    year: null!,
    fav: false,
    author: '',
    description: '',
    image: '',
    publishYear: null!,
    lastUpdate: null!,
    tags: [],
    price: null!,
    category: '',
    averageRating: null!,
    reviews: [],
    isBestseller: false,
    stock: null!,
    discount: null!,
    publisher: '',
    language: ''
  };
  tagInput = '';
  reviewsInput = '';
  constructor(
    private bookService: BookService,
    private router: Router
  ) {}
  updateTags(): void {
    if(!this.book.tags) return;
    this.book.tags = this.book.tags
      .map(t => t.trim())
      .filter(t => t.length); 
  }
  

  updateReviews(): void {
    if(!this.book.reviews) return;
    this.book.reviews = this.book.reviews
      .map(r => r.trim())
      .filter(r => r.length); 
  }

  onRawSubmit(event: Event) {
    event.preventDefault(); // Prevent default form submission
    console.log('Raw submit event:', event);
  }

  submitBook() {
    console.log('Submitting book:', this.book);
    this.bookService.addBook(this.book).subscribe({
      next: (data) => {
        console.log('Book added successfully:', data);
        this.resetBook();
        this.router.navigate(['/books/list']);
        ToastComponent.show('Book added successfully!');
      },
      error: (error) => {
        console.error('Error adding book:', error);
      }
    });
  }

  private resetBook(): void {
    this.book = {
      id: 0,
      name: '',
      year: null!,
      fav: false,
      author: '',
      description: '',
      image: '',
      publishYear: null!,
      lastUpdate: null!,
      tags: [],
      price: null!,
      category: '',
      averageRating: null!,
      reviews: [],
      isBestseller: false,
      stock: null!,
      discount: null!,
      publisher: '',
      language: ''
    };
  }
  
}
