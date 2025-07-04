// src/app/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review, CreateReview } from '../models/review.model';
import { Observable } from 'rxjs';
interface ReviewWithRating{
  review: Review;
  averageRating: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private apiUrl = 'https://localhost:5038/api/books';

  constructor(private http: HttpClient) {}
  
  /** GET /api/books/{bookId}/reviews */
  list(bookId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${bookId}/reviews`);
  }

  /** POST /api/books/{bookId}/reviews */
  create(bookId: number, data: CreateReview): Observable<ReviewWithRating> {
    return this.http.post<ReviewWithRating>(`${this.apiUrl}/${bookId}/reviews`, data);
  }

  delete(bookId: number, reviewId: number): Observable<ReviewWithRating> {
    return this.http.delete<ReviewWithRating>(`${this.apiUrl}/${bookId}/reviews/${reviewId}`);
  }
}
