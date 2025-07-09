import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Notification } from "../models/notification.model";
import { BehaviorSubject, map } from "rxjs";

@Injectable({providedIn:'root'})
export class NotificationService {
  private apiUrl = "https://localhost:5038/api/notifications"
  public notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.notifications$.pipe(
    map(notifications => (notifications ?? []).filter(n => n && !n.isRead).length)
  );

  constructor(private http: HttpClient) {}

  markAsRead(item: Notification): void {
    this.http.put(`${this.apiUrl}/${item.id}/read`, {id: item.id}).subscribe({
      next: () => this.loadNotifications()
    });
  }

  loadNotifications() {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.notificationsSubject.next(data ?? []);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notificationsSubject.next([]); // Always emit array
      }
    });
  }

  deleteNotification(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadNotifications(),
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }
  addNotification(message: string, bookId?: number) {
    const payload: any = { message };
    if (bookId !== undefined) payload.bookId = bookId;
    return this.http.post<Notification>(this.apiUrl, payload);
  }
}