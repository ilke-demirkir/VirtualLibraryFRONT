import { Component } from '@angular/core';
import { NotificationService } from '../../services/notificaitionService';
import { Notification } from '../../models/notification.model';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/authService';
@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  open = false;
  constructor(public notificationService:NotificationService, public auth: AuthService ){}
  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  get notificationsWithMessage() {
    // Only show notifications with a non-null, non-empty message
    return (this.notificationService.notificationsSubject?.getValue() ?? []).filter(n => n.message);
  }

  markAsRead(item: Notification): void {
    this.notificationService.markAsRead(item);
  }

  deleteNotification(item: Notification): void {
    this.notificationService.deleteNotification(item.id);
  }
}
