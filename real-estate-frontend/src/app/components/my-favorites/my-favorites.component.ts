import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { environment } from '../../../environments/environment';
import { PropertyCardComponent } from '../property-card/property-card.component';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">My Favorite Properties</h1>
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      
      <div *ngIf="!loading && favorites.length === 0" class="text-center py-10">
        <p class="text-gray-600 mb-4">You don't have any favorite properties yet.</p>
        <button (click)="navigateToProperties()" class="btn btn-primary">Browse Properties</button>
      </div>
      
      <div *ngIf="!loading && favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-property-card 
          *ngFor="let property of favorites" 
          [property]="property"
        ></app-property-card>
      </div>
    </div>
  `,
  styles: []
})
export class MyFavoritesComponent implements OnInit {
  favorites: Property[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/my-favorites' } 
      });
      return;
    }
    
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/favorites`)
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.favorites = this.propertyService.standardizeProperties(response.data as Property[]);
            
            // Ensure each property has a direct featuredImage property
            this.favorites.forEach(property => {
              if (!property.featuredImage && property.images && property.images.length > 0) {
                property.featuredImage = property.images[0];
              }
              if (!property.featuredImage) {
                property.featuredImage = 'assets/images/prpty.jpg';
              }
            });
          } else {
            this.error = 'Failed to load favorites';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
          this.error = error.error?.message || 'Failed to load favorites';
          this.loading = false;
        }
      });
  }

  navigateToProperties(): void {
    this.router.navigate(['/properties']);
  }
} 