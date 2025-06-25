import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { Book } from '../models/book.model';
import { Location } from '@angular/common';
import { BookService } from '../services/bookService';

@Component({
  selector: 'app-child',
  imports: [CommonModule, RouterLink],
  templateUrl: './child.component.html',
  styleUrl: './child.component.css',
  standalone:true
})
export class ChildComponent implements OnInit {


  constructor(private location:Location, private router:ActivatedRoute) {}
  book!:Book | undefined;

  
  ngOnInit(): void {
      const bookService = inject(BookService);
      const bookId = (this.router.snapshot.paramMap.get("id"));
      this.book = bookService.getBookById(Number(bookId));
      const state =this.location.getState() as {book:Book};
      if(state && state.book){
        this.book = state.book;
      }

      if(!this.book){
        this.book = {id: -1, name:"Unknown", year:0 , fav: false}
      }
  }

  onToggle(id:number) {
    const bookService = inject(BookService);
    if (!this.book) return;
      bookService.toggleFavorite(this.book.id);
      this.book.fav = !this.book.fav;
  }
}
