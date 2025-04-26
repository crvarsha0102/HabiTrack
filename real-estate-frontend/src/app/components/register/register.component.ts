import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <a routerLink="/login" class="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First name</label>
                <div class="mt-1">
                  <input type="text" id="firstName" formControlName="firstName" 
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                </div>
                <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" class="text-red-500 text-xs mt-1">
                  First name is required.
                </div>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last name</label>
                <div class="mt-1">
                  <input type="text" id="lastName" formControlName="lastName" 
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                </div>
                <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" class="text-red-500 text-xs mt-1">
                  Last name is required.
                </div>
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input id="email" name="email" type="email" formControlName="email" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                Please enter a valid email address.
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <div class="mt-1">
                <input id="phone" name="phone" type="tel" formControlName="phone" 
                  placeholder="(123) 456-7890"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" formControlName="password" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                Password must be at least 6 characters long.
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm password</label>
              <div class="mt-1">
                <input id="confirmPassword" name="confirmPassword" type="password" formControlName="confirmPassword" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-xs mt-1">
                Passwords must match.
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="registerForm.invalid" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { firstName, lastName, email, password, phone } = this.registerForm.value;
    
    this.authService.register(firstName, lastName, email, password, phone).subscribe({
      next: (user) => {
        // Log the user info to verify
        console.log('Registered as:', user);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration error', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
} 