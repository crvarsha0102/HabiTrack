import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Hero Section -->
      <section class="bg-primary-600 py-16 md:py-24 px-4">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Dream Property</h1>
              <p class="text-white/90 text-lg mb-8">Discover the perfect home, apartment, or commercial space that fits your needs and budget.</p>
              <div class="flex flex-wrap gap-4">
                <a 
                  *ngIf="isLoggedIn"
                  routerLink="/properties" 
                  class="bg-white text-primary-600 hover:bg-white/90 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Browse Properties
                </a>
                <a 
                  *ngIf="!isLoggedIn"
                  routerLink="/login" 
                  class="bg-white text-primary-600 hover:bg-white/90 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Login
                </a>
                <a 
                  *ngIf="!isLoggedIn"
                  routerLink="/register" 
                  class="bg-transparent border border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Sign Up
                </a>
              </div>
            </div>
            <div class="hidden md:block">
              <!-- Image Carousel -->
              <div class="relative w-full h-96 rounded-lg shadow-lg overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center">
                  <img 
                    [src]="carouselImages[currentImageIndex]" 
                    alt="Featured Property" 
                    class="w-full h-full object-cover"
                    (error)="handleImageError($event)"
                  >
                </div>
                <div class="absolute bottom-0 left-0 right-0 flex justify-center p-2 bg-black/30">
                  <div class="flex space-x-1">
                    <button 
                      *ngFor="let image of carouselImages; let i = index" 
                      (click)="setCurrentImage(i)"
                      class="w-2 h-2 rounded-full"
                      [ngClass]="i === currentImageIndex ? 'bg-white' : 'bg-white/50'"
                    ></button>
                  </div>
                </div>
                <button 
                  (click)="prevImage()" 
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  (click)="nextImage()" 
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Properties Section -->
      <section class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Properties</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Property cards -->
            <div *ngFor="let property of featuredProperties" class="bg-white rounded-lg shadow-card overflow-hidden">
              <a [routerLink]="isLoggedIn ? ['/properties', property.id] : ['/login']" class="block">
                <img [src]="property.featuredImage" [alt]="property.title" class="h-48 w-full object-cover">
                <div class="p-4">
                  <h3 class="text-xl font-semibold mb-2">{{ property.title }}</h3>
                  <p class="text-gray-600 mb-4">{{ property.bedrooms }} bed, {{ property.bathrooms }} bath • {{ property.city }}, {{ property.state }}</p>
                  <p class="text-primary-600 font-bold">{{ property.listingType === 'RENT' ? '$' + property.price + '/month' : '$' + property.price }}</p>
                </div>
              </a>
            </div>
          </div>
          <div class="text-center mt-12">
            <a 
              *ngIf="isLoggedIn"
              routerLink="/properties" 
              class="bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              View All Properties
            </a>
            <a 
              *ngIf="!isLoggedIn"
              routerLink="/login" 
              class="bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Login to View All Properties
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProperties: Property[] = [];
  isLoggedIn: boolean = false;
  carouselImages: string[] = [
    'assets/images/carousel/property1.jpg',
    'assets/images/carousel/property2.jpg',
    'assets/images/carousel/property3.jpg',
    'assets/images/carousel/property4.jpg'
  ];
  
  // Fallback image if the carousel images fail to load
  fallbackImage: string = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80';
  
  currentImageIndex: number = 0;
  carouselInterval: any;
  private isBrowser: boolean;
  isDevEnvironment = !environment.production;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Only subscribe to auth state and start carousel on browser
    if (this.isBrowser) {
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      });
      this.startCarousel();
    }
    
    // Load featured properties with error handling
    this.loadFeaturedProperties();
  }
  
  ngOnDestroy(): void {
    if (this.isBrowser && this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  loadFeaturedProperties(): void {
    // Set a default value for SSR
    if (!this.isBrowser) {
      this.featuredProperties = [];
      return;
    }
    
    this.propertyService.getFeaturedProperties(3).subscribe({
      next: (properties) => {
        if (properties && Array.isArray(properties)) {
          this.featuredProperties = properties.filter(property => property !== null && property !== undefined);
        } else {
          console.error('Invalid featured properties data');
          this.featuredProperties = [];
        }
      },
      error: (error) => {
        console.error('Error loading featured properties', error);
        this.featuredProperties = [];
      }
    });
  }
  
  startCarousel(): void {
    if (!this.isBrowser) return;
    
    // Auto-rotate images every 5 seconds
    this.carouselInterval = setInterval(() => {
      this.nextImage();
    }, 5000);
  }
  
  nextImage(): void {
    if (!this.isBrowser) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
  }
  
  prevImage(): void {
    if (!this.isBrowser) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }
  
  setCurrentImage(index: number): void {
    if (!this.isBrowser) return;
    this.currentImageIndex = index;
  }

  handleImageError($event: Event): void {
    // Handle image error by setting a fallback image
    const imgElement = $event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.fallbackImage;
    }
  }
} 