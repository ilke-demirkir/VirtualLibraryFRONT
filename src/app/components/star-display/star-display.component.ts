// src/app/shared/star-display.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';

@Component({
  selector: 'app-star-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-display.component.html',
  styleUrls: ['./star-display.component.scss'],
})
export class StarDisplayComponent {
  @Input() rating = 0;
  @Input() max    = 5;

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
