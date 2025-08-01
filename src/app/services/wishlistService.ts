import { Injectable, ɵɵngDeclareInjectable, OnDestroy } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Book } from "../models/book.model";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import { tap } from 'rxjs/operators';
import { WishlistItem } from "../models/wishlist.model";
import { AuthService } from "./authService";

@Injectable({providedIn:'root'})
export class WishlistService implements OnDestroy {
    private apiUrl = 'https://localhost:5038/api'
    private _items = new BehaviorSubject<WishlistItem[]>([]);
    public items$ = this._items.asObservable()
    private authSubscription?: Subscription;
    
    constructor(private http:HttpClient, private auth: AuthService){
        // Initialize with empty array so buttons show up
        this._items.next([]);
        
        // Listen to authentication state changes
        this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.load();
            } else {
                // Clear wishlist data when user logs out
                this._items.next([]);
            }
        });
        
        // Only load wishlist if user is authenticated
        if (this.auth.isLoggedIn()) {
            this.load();
        }
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    // Clear wishlist data (called when user switches)
    clearWishlistData() {
        this._items.next([]);
    }

    private load() {
        // Check authentication before making API call
        if (!this.auth.isLoggedIn()) {
            this._items.next([]);
            return;
        }
        
        this.http.get<WishlistItem[]>(`${this.apiUrl}/wishlist`).subscribe({
            next: items => this._items.next(items),
            error: err => {
                console.error('Error loading wishlist:', err);
                this._items.next([]);
            }
        });
    }
    
    add(bookId: number){
        // Check authentication before making API call
        if (!this.auth.isLoggedIn()) {
            return new Observable(observer => {
                observer.error('User not authenticated');
                observer.complete();
            });
        }
        
        return this.http.post(`${this.apiUrl}/wishlist`, {bookId}).pipe(tap( ()=> this.load()));
    }

    remove(bookId:number){
        // Check authentication before making API call
        if (!this.auth.isLoggedIn()) {
            return new Observable(observer => {
                observer.error('User not authenticated');
                observer.complete();
            });
        }
        
        return this.http.delete(`${this.apiUrl}/wishlist/${bookId}`).pipe(tap( () => this.load()));
    }
    
    refreshWishlist(){
        return this.load();
    }
}