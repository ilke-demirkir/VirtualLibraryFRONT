import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notificaitionService';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-add-notification',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-notification.component.html',
  styleUrl: './add-notification.component.scss'
})
export class AddNotificationComponent {
  notificationForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  constructor(private fb: FormBuilder, private notificationService: NotificationService) {
    this.notificationForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  onSubmit() {
    if (this.notificationForm.invalid) return;
    this.isSubmitting = true;
    const { message } = this.notificationForm.value;
    this.notificationService.addNotification(message).subscribe({
      next: (newNotification) => {
        // Optionally update the notification list
        const currentNotifications = this.notificationService.notificationsSubject.getValue();
        this.notificationService.notificationsSubject.next([...currentNotifications, newNotification]);
        this.notificationForm.reset();
        this.isSubmitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.submitSuccess = false, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        ToastComponent.show('Failed to add notification. Please try again.');
      }
    });
  }
}
