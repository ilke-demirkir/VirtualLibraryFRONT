import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authService';
import { User } from '../../models/user.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../toast/toast.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  editMode = false;
  editUser: Partial<User> = {};
  private authSubscription?: Subscription;

  constructor(private auth: AuthService, private route:ActivatedRoute) {}

  ngOnInit(): void {
    // Listen to authentication state changes
    this.authSubscription = this.auth.authState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadUserProfile();
      } else {
        // Clear user data when user logs out
        this.user = null;
        this.loading = false;
        this.editMode = false;
      }
    });

    // Initial load if already logged in
    if (this.auth.isLoggedIn()) {
      this.loadUserProfile();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private loadUserProfile() {
    // Check if user is authenticated before making API calls
    if (!this.auth.isLoggedIn()) {
      this.loading = false;
      return;
    }

    this.auth.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.editUser = { ...user };
      },
      error: () => {
        this.user = null;
        this.loading = false;
      }
    });
  }

  get avatarUrl(): string {
    if (this.editMode && this.editUser.avatarUrl) return this.editUser.avatarUrl;
    if (this.user?.avatarUrl) return this.user.avatarUrl;
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.user?.username || 'User') + '&background=8ab4f8&color=fff&rounded=true&size=128';
  }

  get bio(): string {
    return this.user?.bio || 'No bio set yet.';
  }

  get createdAt(): string {
    if (!this.user?.createdAt) return '—';
    return new Date(this.user.createdAt).toLocaleDateString();
  }

  startEdit() {
    this.editMode = true;
    this.editUser = { ...this.user };
    this.editUser.password = '';
  }

  cancelEdit() {
    this.editMode = false;
    this.editUser = { ...this.user };
    this.editUser.password = '';
  }

  saveEdit() {
    if (!this.user) return;
    const updatePayload: any = { ...this.editUser };
    if (!updatePayload.password) {
      delete updatePayload.password;
    }
    this.auth.editUser(updatePayload).subscribe({
      next: (updatedUser) => {
        this.user = { ...this.user, ...updatedUser };
        this.editMode = false;
        ToastComponent.show("User profile updated successfully!")
      },
      error: () => {
        ToastComponent.show("Failed to update user profile. Please try again.");}
    });
    this.auth.getCurrentUser();

  }
} 