import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div class="bg-white rounded-lg shadow-card overflow-hidden">
            <!-- Profile Header -->
            <div class="p-6 bg-primary-600 text-white flex flex-col md:flex-row gap-6 items-center">
              <div class="flex-shrink-0">
                <div class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                  {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold">{{ user?.firstName }} {{ user?.lastName }}</h2>
                <p class="text-white/80">{{ user?.email }}</p>
                <p *ngIf="user?.phone" class="text-white/80">{{ user?.phone }}</p>
              </div>
            </div>
            
            <!-- Profile Form -->
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Edit Profile Information</h3>
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" id="firstName" formControlName="firstName" 
                      class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <div *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched" class="text-red-500 text-xs mt-1">
                      First name is required.
                    </div>
                  </div>
                  
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" id="lastName" formControlName="lastName" 
                      class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <div *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched" class="text-red-500 text-xs mt-1">
                      Last name is required.
                    </div>
                  </div>
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" id="email" formControlName="email" 
                    class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                    Please enter a valid email.
                  </div>
                </div>
                
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" id="phone" formControlName="phone" 
                    class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <p *ngIf="!profileForm.get('phone')?.value" class="text-sm text-gray-500 mt-1">
                    No phone number provided. Please add one for better communication.
                  </p>
                </div>
                
                <div>
                  <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea id="bio" formControlName="bio" rows="3"
                    class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                </div>
                
                <div class="pt-4 border-t border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type="password" id="currentPassword" formControlName="currentPassword" 
                        class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    </div>
                    
                    <div>
                      <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" id="newPassword" formControlName="newPassword" 
                        class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <div *ngIf="profileForm.get('newPassword')?.errors?.['minlength']" class="text-red-500 text-xs mt-1">
                        Password must be at least 6 characters long.
                      </div>
                    </div>
                    
                    <div>
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input type="password" id="confirmPassword" formControlName="confirmPassword" 
                        class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <div *ngIf="passwordsNotMatching()" class="text-red-500 text-xs mt-1">
                        Passwords must match.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button type="submit" [disabled]="profileForm.invalid || passwordsNotMatching()"
                    class="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    });
  }
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        
        // Pre-fill the form with user data
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          bio: user.bio || ''
        });
      }
    });
  }
  
  passwordsNotMatching(): boolean {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    
    return newPassword && confirmPassword && newPassword !== confirmPassword;
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid || this.passwordsNotMatching()) {
      return;
    }
    
    const profileData = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone,
      bio: this.profileForm.value.bio
    };
    
    // Handle updating profile
    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        // Handle success (show message, etc.)
      },
      error: (error) => {
        console.error('Error updating profile', error);
        // Handle error (show message, etc.)
      }
    });
    
    // Check if password change was requested
    if (this.profileForm.value.currentPassword && this.profileForm.value.newPassword) {
      this.authService.changePassword(
        this.profileForm.value.currentPassword,
        this.profileForm.value.newPassword
      ).subscribe({
        next: () => {
          // Handle password change success
          // Reset password fields
          this.profileForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        },
        error: (error) => {
          console.error('Error changing password', error);
          // Handle password change error
        }
      });
    }
  }
} 