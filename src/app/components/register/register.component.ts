import { Component } from '@angular/core';
import { RegisterRequest } from '../../models/user.model';
import { AuthService } from '../../services/authService';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  data:RegisterRequest = { username: '', email: '', password: '' }; 
  constructor(private authService:AuthService, private router:Router) { }
  register() {
    console.log('Registering user:', this.data);
    this.authService.register(this.data).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        console.log('Registration successful:', response);
        // Optionally, redirect to login or home page
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        const msg = error?.error?.message || error?.error || 'Registration failed. Please try again.';
        ToastComponent.show(msg);
      }
    });
  }
}
