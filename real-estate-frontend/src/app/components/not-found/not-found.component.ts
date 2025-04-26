import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center">
        <h1 class="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/" class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Go back home
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {} 