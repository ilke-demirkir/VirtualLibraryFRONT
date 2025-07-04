import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookService } from '../../services/bookService';
import { Book } from '../../models/book.model';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-book.component.html',
  styleUrls: ['./edit-book.component.scss']
})
export class EditBookComponent implements OnInit, OnDestroy {
  book!: Book;
  tagInput = '';
  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sub = this.bookService.books$.subscribe(books => {
      const found = books.find(b => b.id === id);
      this.book = found
        ? { ...found }
        : {
          id: -1,
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
      // initialize tagInput to comma-joined tags
      if(this.book.tags){
        this.tagInput = this.book.tags.join(', ');

      }
    });
  }

  updateTags(): void {
    this.book.tags = this.tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length);
  }

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe({
      next: () => {
        console.log(`Book with ID ${id} deleted successfully.`);
        // Optionally refresh the book list
        this.bookService.refreshBooks();
        ToastComponent.show(`Book deleted successfully!`);
        this.router.navigate(['/books/list']);
      },
      error: (error) => {
        console.error(`Error deleting book with ID ${id}:`, error);
        ToastComponent.show(`Failed to delete book.`);
      }
    });
  }

  toggleBestSeller(): void {
    this.book.isBestseller = !this.book.isBestseller;
  }
  save(): void {
    this.book.lastUpdate = new Date().toISOString();
  
    this.bookService.updateBook(this.book).subscribe({
      next: updated => {
        // optionally refresh the list or let the tap() in the service update your BehaviorSubject
        this.router.navigate(['/books', updated.id]);
        ToastComponent.show('Book updated successfully!');
      },
      error: err => {
        console.error(err);
        ToastComponent.show('Failed to update book.');
      }
    });
  }
  

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
