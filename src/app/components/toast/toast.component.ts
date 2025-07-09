import { CommonModule } from '@angular/common';
import { Component, signal, effect, Injectable } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [CommonModule],
})
export class ToastComponent {
  static toasts = signal<string[]>([]);

  constructor() {
    // Auto-remove each toast after 4s
    effect(() => {
      ToastComponent.toasts().forEach((_, i) => {
        setTimeout(() => {
          ToastComponent.toasts.update(t => t.filter((_, j) => j !== i));
        }, 4000);
      });
    });
  }

  get toasts() {
    return ToastComponent.toasts();
  }

  static show(message: string, payload?: any) {
    let text = message;
    if (payload) {
      // for example, if payload is a CartItem:
      if (payload.book) {
        text += `: ${payload.book.name}`;
      } else {
        // fallback to JSON
        text += `: ${JSON.stringify(payload)}`;
      }
    }
    ToastComponent.toasts.update(list => [...list, text]);
  }
}
