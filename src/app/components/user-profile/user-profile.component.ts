import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authService';
import { User } from '../../models/user.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(private auth: AuthService, private route:ActivatedRoute) {}

  ngOnInit(): void {
    // Replace with your actual user-fetching logic
    // If you have a UserService, use that instead
    const id =
    this.auth.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.user = null;
        this.loading = false;
      }
    });
  }

  get avatarUrl(): string {
    if (this.user?.avatarUrl) return this.user.avatarUrl;
    // Placeholder avatar (can use a local asset or a service like ui-avatars)
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.user?.username || 'User') + '&background=8ab4f8&color=fff&rounded=true&size=128';
  }

  get bio(): string {
    return this.user?.bio || 'No bio set yet.';
  }

  get createdAt(): string {
    if (!this.user?.createdAt) return '—';
    return new Date(this.user.createdAt).toLocaleDateString();
  }
} 