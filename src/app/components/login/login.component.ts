import { Component, OnInit } from '@angular/core';
import { LoginRequest, User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authService';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastComponent } from '../toast/toast.component';
import { NotificationService } from '../../services/notificaitionService';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }
  showMessage = false;
  data:LoginRequest = { username: '', password: '' };
  login() {
    console.log('Logging in user:', this.data);
    this.authService.login(this.data).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        // Use switchUser to clear old data and prepare for new user
        this.authService.switchUser();
        this.notificationService.loadNotifications();
        console.log('Login successful:', response);
        this.router.navigate(['/home']);  // Navigate to home after successful login
      },
      error: (error) => {
        console.error('Login failed:', error);
        ToastComponent.show('Login failed. Please check your credentials and try again.');
      }
    });
  }
  ngOnInit(): void {
    // Check if there's a 'reason' query parameter in the URL
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'unauthorized') {
        ToastComponent.show('You must be logged in to access this page.');
      }
    });
  }
  

}
