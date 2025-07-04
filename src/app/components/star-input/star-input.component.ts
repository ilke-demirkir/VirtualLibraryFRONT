// src/app/shared/star-input.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';

@Component({
  selector: 'app-star-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-input.component.html',
  styleUrls: ['./star-input.component.scss'],
})
export class StarInputComponent {
  @Input()  rating = 0;
  @Input()  max    = 5;
  @Output() ratingChange = new EventEmitter<number>();

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  rate(n: number) {
    this.rating = n;
    this.ratingChange.emit(this.rating);
  }
}
