import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookImportService {
  constructor(private http: HttpClient) {}

  importByTitle(title: string): Observable<void> {
    const url = `https://localhost:5038/api/books/import?title=${encodeURIComponent(title)}`;
    return this.http.post<void>(url, {});
  }

}
