import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        <div *ngIf="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        
        <div *ngIf="!loading">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">User Management</h2>
            <div>
              <button (click)="loadUsers()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Refresh
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border">
              <thead>
                <tr>
                  <th class="py-2 px-4 border-b text-left">ID</th>
                  <th class="py-2 px-4 border-b text-left">Name</th>
                  <th class="py-2 px-4 border-b text-left">Email</th>
                  <th class="py-2 px-4 border-b text-left">Role</th>
                  <th class="py-2 px-4 border-b text-left">Status</th>
                  <th class="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users" class="hover:bg-gray-50">
                  <td class="py-2 px-4 border-b">{{ user.id }}</td>
                  <td class="py-2 px-4 border-b">{{ user.firstName }} {{ user.lastName }}</td>
                  <td class="py-2 px-4 border-b">{{ user.email }}</td>
                  <td class="py-2 px-4 border-b">{{ user.role }}</td>
                  <td class="py-2 px-4 border-b">
                    <span 
                      [ngClass]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-2 py-1 rounded text-xs font-medium">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="py-2 px-4 border-b">
                    <button 
                      *ngIf="user.isActive"
                      (click)="deactivateUser(user.id!)" 
                      class="mr-2 text-yellow-600 hover:text-yellow-900"
                      title="Deactivate User">
                      Deactivate
                    </button>
                    <button 
                      *ngIf="!user.isActive"
                      (click)="activateUser(user.id!)" 
                      class="mr-2 text-green-600 hover:text-green-900"
                      title="Activate User">
                      Activate
                    </button>
                    <button 
                      (click)="deleteUser(user.id!)" 
                      class="text-red-600 hover:text-red-900"
                      title="Delete User">
                      Delete
                    </button>
                  </td>
                </tr>
                <tr *ngIf="users.length === 0">
                  <td colspan="6" class="py-4 text-center text-gray-500">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-6">
            <h2 class="text-xl font-semibold mb-4">System Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-blue-50 p-4 rounded shadow">
                <h3 class="font-medium text-blue-800">Total Users</h3>
                <p class="text-2xl font-bold">{{ users.length }}</p>
              </div>
              <div class="bg-green-50 p-4 rounded shadow">
                <h3 class="font-medium text-green-800">Active Users</h3>
                <p class="text-2xl font-bold">{{ users.filter(u => u.isActive).length }}</p>
              </div>
              <div class="bg-purple-50 p-4 rounded shadow">
                <h3 class="font-medium text-purple-800">Admin Users</h3>
                <p class="text-2xl font-bold">{{ users.filter(u => u.role === 'ADMIN').length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Only load users if the current user is an admin
      if (user?.role === UserRole.ADMIN) {
        this.loadUsers();
      } else {
        this.error = 'You do not have permission to access this page';
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${environment.apiUrl}/api/admin/users`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data;
          } else {
            this.error = response.message || 'Failed to load users';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'An error occurred while loading users';
          this.loading = false;
        }
      });
  }

  activateUser(userId: number): void {
    this.http.put<any>(`${environment.apiUrl}/api/admin/users/${userId}/activate`, {})
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          } else {
            this.error = response.message || 'Failed to activate user';
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'An error occurred while activating user';
        }
      });
  }

  deactivateUser(userId: number): void {
    this.http.put<any>(`${environment.apiUrl}/api/admin/users/${userId}/deactivate`, {})
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          } else {
            this.error = response.message || 'Failed to deactivate user';
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'An error occurred while deactivating user';
        }
      });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.http.delete<any>(`${environment.apiUrl}/api/admin/users/${userId}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadUsers();
            } else {
              this.error = response.message || 'Failed to delete user';
            }
          },
          error: (err) => {
            this.error = err.error?.message || 'An error occurred while deleting user';
          }
        });
    }
  }
} 