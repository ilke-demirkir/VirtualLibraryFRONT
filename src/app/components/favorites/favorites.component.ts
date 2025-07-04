import { Component, OnInit } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterModule }               from '@angular/router';
import { map }                        from 'rxjs/operators';
import { BookService }              from '../../services/bookService';
import { Observable } from 'rxjs';
import { Book } from '../../models/book.model';
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites$!: Observable<Book[]>;
  constructor(private bookService:BookService) {}
  // stream of only the favorited books
  


  ngOnInit(): void {
    // ensure we’ve loaded the latest book list
    this.bookService.refreshBooks();
    this.favorites$ = this.bookService.books$.pipe(
      map(books => books.filter(b => b.fav))
    );
  }

  removeFromFav(id: number) {
    this.bookService.toggleFavorite(id);
  }

 
}
