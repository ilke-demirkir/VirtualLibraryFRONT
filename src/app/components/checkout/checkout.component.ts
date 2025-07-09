// checkout.component.ts
import {
  Component, OnInit, ViewChild,
  ElementRef, Renderer2
} from '@angular/core';
import { PaymentService } from '../../services/paymentService';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [CommonModule]
})
export class CheckoutComponent implements OnInit {
  @ViewChild('iyziHost', { static: true }) host!: ElementRef;
  loading = true;
  error = '';

  constructor(
    private payment: PaymentService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.payment.createForm().subscribe({
      next: html => {
        this.insertAndRun(html);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Could not load payment form.';
        ToastComponent.show('Could not load payment form. Please try again.');
        this.loading = false;
      }
    });
  }

  private insertAndRun(html: string) {
    // 1) Insert the raw HTML
    this.renderer.setProperty(
      this.host.nativeElement,
      'innerHTML',
      html
    );

    // 2) Find any <script> tags that were just injected
    const scripts = this.host.nativeElement.querySelectorAll('script');
    scripts.forEach((oldScript: HTMLScriptElement) => {
      // Create a fresh <script> to force execution
      const newScript = this.renderer.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.text = oldScript.text;
      }
      this.renderer.appendChild(this.host.nativeElement, newScript);
      // Remove the old inert script
      this.renderer.removeChild(this.host.nativeElement, oldScript);
    });
  }
}
