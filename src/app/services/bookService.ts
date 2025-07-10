import { Injectable, ɵɵngDeclareInjectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Book } from "../models/book.model";
import { Observable,BehaviorSubject } from "rxjs";
import { tap } from 'rxjs/operators';
import { AuthService } from "./authService";

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
}
@Injectable({providedIn:'root'})
export class BookService{
    refreshBooks() {
        this.loadBooks();
    }
    getCurrentBooks(): Book[] {
        return this.booksSubject.getValue();
    }
    private apiUrl = "https://localhost:5038/api/books"; 

    constructor(private http: HttpClient, private auth: AuthService) {
        this.loadBooks();
    }
    private booksSubject = new BehaviorSubject<Book[]>([]);
    public books$ = this.booksSubject.asObservable();


    private loadBooks() {
        this.http.get<PagedResult<Book>>(this.apiUrl,{
            params: new HttpParams().set('page', '1').set('pageSize', '1000') // Load all books initially
        })
        .subscribe({
            next: (paged) => {
                this.booksSubject.next(paged.items);
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
    get(id: number): Observable<Book> {
        return this.http.get<Book>(`${this.apiUrl}/${id}`);
    }
      
    updateBook(book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book).pipe(
        tap((updatedBook) => {
        const books = this.booksSubject.getValue();
        const index = books.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
            books[index] = updatedBook;
            this.booksSubject.next([...books]);
        }
        })
    );
    }

      
    toggleFavorite(id: number) {
        // Check authentication before making API call
        if (!this.auth.isLoggedIn()) {
            console.warn('User must be logged in to toggle favorites');
            return;
        }

        // find the current book
        const books = this.booksSubject.getValue();
        const book = books.find(b => b.id === id);
        if (!book) return;
      
        const newFav = !book.fav;
        // call the backend
        this.http
          .patch<Book>(`${this.apiUrl}/${book.id}`, { fav: newFav })
          .subscribe({
            next: updatedBook => {
              // replace the book in the local array and emit
              const updatedList = books.map(b =>
                b.id === id ? updatedBook : b
              );
              this.booksSubject.next(updatedList);
            },
            error: err => console.error('Could not update favorite:', err)
          });
      }

    getAllBooks(title: string, page = 1, pageSize = 12, authors:string[], categories:string[], years:number[], featured:boolean): Observable<{items:Book[]; totalCount:number}>{
        let params = new HttpParams().set('title', title).set('page', page.toString()).set('pageSize', pageSize.toString());

        authors.forEach(author => params = params.append('authors', author));
        categories.forEach(category => params = params.append('categories', category));
        years.forEach(year => params = params.append('years', year.toString()));
        featured && (params = params.append('featured', 'true'));
        return this.http.get<{items:Book[]; totalCount:number}>(this.apiUrl, {params})
    }

    deleteBook(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                const remaining = this.booksSubject.getValue().filter(b => b.id !== id);
                this.booksSubject.next(remaining);
            })
        );
    }

    getPopularCategories(limit = 6): Observable<{category: string, count: number}[]> {
        return this.http.get<{category: string, count: number}[]>(`https://localhost:5038/api/books/popular?limit=${limit}`);
    }
}