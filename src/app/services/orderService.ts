// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderSummary, OrderDetail } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'https://localhost:5038/api/orders';

  constructor(private http: HttpClient) {}

  list(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(this.apiUrl);
  }

  get(id: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/${id}`);
  }
}
