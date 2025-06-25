import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Book } from "../models/book.model";
import { Observable,BehaviorSubject } from "rxjs";


@Injectable({providedIn:'root'})
export class BookService{
    refreshBooks() {
        this.loadBooks();
    }
    private apiUrl = "http://localhost:5038/api/books"; 

    constructor(private http: HttpClient) {
        this.loadBooks();
    }
    private booksSubject = new BehaviorSubject<Book[]>([]);
    public books$ = this.booksSubject.asObservable();


    private loadBooks() {
        this.http.get<Book[]>(this.apiUrl).subscribe({
            next: (books) => {
                this.booksSubject.next(books);
            },
            error: (error) => {
                console.error('Error loading books:', error);
            }
        });
    }
    addBook(book: Book) {
        return this.http.post<Book>(this.apiUrl, book);
    }
    getBookById(id: number): Book | undefined {
        return this.booksSubject.getValue().find(b => b.id === id);
    }
    

    toggleFavorite(id:number){
        const books = this.booksSubject.getValue();
        const book = books.find(b => b.id === id);
        if (book) {
            book.fav = !book.fav;
            this.booksSubject.next([...books]); // emit updated copy
        }
    }

    getAllBooks(): Observable<Book[]>{
        return this.http.get<Book[]>(this.apiUrl);
    }
}