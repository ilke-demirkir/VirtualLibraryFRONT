import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, RegisterRequest, LoginResponse } from '../models/user.model';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
interface JwtPayload {
  sub: string;
  role?: string; // Optional, depending on your JWT structure
  // Add other properties from your JWT payload as needed
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://localhost:5038/api';

  constructor(private http: HttpClient, private router:Router) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
    // Clear any cached user data
    this.clearUserData();
    this.router.navigate(['/login']); // Redirect to login after logout
  }

  clearUserData() {
    // Clear any cached user information
    // This ensures fresh data is loaded when a new user logs in
    localStorage.removeItem('userData');
  }
  isAdmin(): boolean {
    const token = this.getToken();
    if(!token) return false;
    try {
      const payload = jwtDecode<Record<string, any>>(token)
      if (payload['role'] === 'Admin') return true; // Check if the isAdmin property exists and is true

      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return roleClaim === 'Admin'; // Check for the role claim
    } catch (error) { 
      console.error('Error decoding token:', error);
      return false; // If there's an error, assume the user is not an admin
    }
  }
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token; // Returns true if token exists, false otherwise
  }

  // src/app/services/auth.service.ts
  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = jwtDecode<Record<string, any>>(token);

      // grab the claim exactly as it appears
      const rawId = 
           payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? payload['sub'];

      return rawId ? parseInt(rawId, 10) : null;
    } catch (e) {
      console.error('Error decoding token for userId', e);
      return null;
    }
  }

  getCurrentUser(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return new Observable(observer => {
        observer.error('User not logged in');
        observer.complete();
      });
    }
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  editUser(data: any): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return new Observable(observer => {
        observer.error('User not logged in');
        observer.complete();
      });
    }
    return this.http.patch(`${this.baseUrl}/${userId}`, data);
  }

}
