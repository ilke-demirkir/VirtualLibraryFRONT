import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Notification } from "../models/notification.model";
import { BehaviorSubject, map, Subscription } from "rxjs";
import { AuthService } from "./authService";

@Injectable({providedIn:'root'})
export class NotificationService implements OnDestroy {
  private apiUrl = "https://localhost:5038/api/notifications"
  public notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.notifications$.pipe(
    map(notifications => (notifications ?? []).filter(n => n && !n.isRead).length)
  );
  private authSubscription?: Subscription;

  constructor(private http: HttpClient, private auth: AuthService) {
    // Listen to authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadNotifications();
      } else {
        // Clear notifications when user logs out
        this.notificationsSubject.next([]);
      }
    });

    // Initial load if already logged in
    if (this.auth.isLoggedIn()) {
      this.loadNotifications();
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Clear notification data (called when user switches)
  clearNotificationData() {
    this.notificationsSubject.next([]);
  }

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