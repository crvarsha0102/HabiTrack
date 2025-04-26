import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyType, PropertySearchParams } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { PropertyStatus } from '../../models/property-status.enum';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Properties</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Filters -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-card p-6">
            <h2 class="text-xl font-semibold mb-4">Filters</h2>
            <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="space-y-4">
              <div>
                <label for="listingType" class="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select 
                  id="listingType" 
                  formControlName="listingType" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option [value]="ListingType.SALE">For Sale</option>
                  <option [value]="ListingType.RENT">For Rent</option>
                </select>
              </div>
              
              <div>
                <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  id="propertyType" 
                  formControlName="propertyType" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Property Types</option>
                  <option [value]="PropertyType.HOUSE">House</option>
                  <option [value]="PropertyType.APARTMENT">Apartment</option>
                  <option [value]="PropertyType.CONDO">Condo</option>
                  <option [value]="PropertyType.TOWNHOUSE">Townhouse</option>
                  <option [value]="PropertyType.LAND">Land</option>
                  <option [value]="PropertyType.COMMERCIAL">Commercial</option>
                </select>
              </div>
              
              <div>
                <label for="minPrice" class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input 
                  type="number" 
                  id="minPrice" 
                  formControlName="minPrice" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Min Price"
                >
              </div>
              
              <div>
                <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input 
                  type="number" 
                  id="maxPrice" 
                  formControlName="maxPrice" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Max Price"
                >
              </div>
              
              <div>
                <label for="minArea" class="block text-sm font-medium text-gray-700 mb-1">Min Area (sq ft)</label>
                <input 
                  type="number" 
                  id="minArea" 
                  formControlName="minArea" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Min Area"
                >
              </div>
              
              <div>
                <label for="maxArea" class="block text-sm font-medium text-gray-700 mb-1">Max Area (sq ft)</label>
                <input 
                  type="number" 
                  id="maxArea" 
                  formControlName="maxArea" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Max Area"
                >
              </div>
              
              <div>
                <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select 
                  id="bedrooms" 
                  formControlName="bedrooms" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              
              <div>
                <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select 
                  id="bathrooms" 
                  formControlName="bathrooms" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              
              <div class="pt-4">
                <button 
                  type="submit" 
                  class="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
              
              <div class="pt-2">
                <button 
                  type="button" 
                  (click)="resetFilters()" 
                  class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Property List -->
        <div class="lg:col-span-3">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let property of properties" class="bg-white rounded-lg shadow-card overflow-hidden">
              <a [routerLink]="['/properties', property.id]" class="block">
                <img [src]="property.featuredImage || property.images[0] || 'assets/images/property-placeholder.jpg'" [alt]="property.title" class="h-48 w-full object-cover">
                <div class="p-4">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-semibold">{{ property.title }}</h3>
                    <span class="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {{ property.listingType === ListingType.RENT ? 'For Rent' : 'For Sale' }}
                    </span>
                  </div>
                  <p class="text-gray-600 mb-2" *ngIf="property.propertyType !== PropertyType.LAND">
                    {{ property.bedrooms }} bed, {{ property.bathrooms }} bath • {{ property.area || property.squareFeet }} sq ft
                  </p>
                  <p class="text-gray-600 mb-2" *ngIf="property.propertyType === PropertyType.LAND">
                    Land • {{ property.area || property.squareFeet }} sq ft
                  </p>
                  <p class="text-gray-600 mb-4">{{ property.location || (property.address + (property.city ? ', ' + property.city : '') + (property.state ? ', ' + property.state : '')) }}</p>
                  <p class="text-primary-600 font-bold">{{ property.listingType === ListingType.RENT ? '$' + property.price + '/month' : '$' + property.price }}</p>
                </div>
              </a>
            </div>
          </div>
          
          <div *ngIf="properties.length === 0 && !loading" class="text-center py-12">
            <p class="text-gray-500 text-lg">No properties found matching your criteria.</p>
            <button 
              (click)="resetFilters()" 
              class="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PropertyListComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  filterForm: FormGroup;
  PropertyType = PropertyType;
  ListingType = ListingType;
  PropertyStatus = PropertyStatus;
  loading = false;
  currentPage = 1;
  pageSize = 100;
  totalElements = 0;
  totalPages = 0;
  private routerSubscription: Subscription | null = null;

  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    console.log('PropertyListComponent constructed');
    this.filterForm = this.fb.group({
      listingType: [''],
      propertyType: [''],
      minPrice: [''],
      maxPrice: [''],
      minArea: [''],
      maxArea: [''],
      bedrooms: [''],
      bathrooms: ['']
    });
    
    console.log('Initial page size:', this.pageSize);
  }

  ngOnInit(): void {
    console.log('PropertyListComponent initialized');
    
    // Load all properties immediately on component init
    this.loadProperties(true);
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      console.log('Query params changed:', params);
      
      // Only apply filters if there are actual query params
      const hasParams = Object.keys(params).length > 0;
      
      if (hasParams) {
        console.log('Applying query params as filters');
        // Reset form with new params
        this.filterForm.patchValue({
          listingType: params['listingType'] || '',
          propertyType: params['propertyType'] || '',
          minPrice: params['minPrice'] || '',
          maxPrice: params['maxPrice'] || '',
          minArea: params['minArea'] || '',
          maxArea: params['maxArea'] || '',
          bedrooms: params['bedrooms'] || '',
          bathrooms: params['bathrooms'] || ''
        });
        
        // Load properties with the parameters
        this.loadPropertiesWithFilters();
      }
    });
    
    // Subscribe to router events for page refreshes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Only reload on navigation to properties page with no query params
        if (this.router.url === '/properties') {
          console.log('Navigated to properties page with no filters');
          this.loadProperties(true);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Modified loadProperties method with refresh parameter
  loadProperties(refresh: boolean = false): void {
    this.loading = true;
    console.log('Loading properties with refresh =', refresh, 'and page size =', this.pageSize);
    
    // Use timestamp as a cache-busting technique when refresh is true
    const timestamp = new Date().getTime().toString();
    
    const params: PropertySearchParams = {
      page: 0, // Always start from first page
      limit: this.pageSize,
      status: PropertyStatus.ACTIVE,
      refresh: timestamp // Always add timestamp as a query param for cache busting
    };
    
    console.log('Calling propertyService.getProperties with params:', params);
    
    this.propertyService.getProperties(params).subscribe({
      next: (response) => {
        console.log('Properties loaded response:', response);
        
        if (response && response.content) {
          console.log('Number of properties returned:', response.content.length);
          this.properties = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
        } else {
          console.warn('Invalid response structure:', response);
          this.properties = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
        
        this.loading = false;
        
        if (this.properties.length === 0 && !refresh) {
          console.log('No properties returned from API. Trying again with increased page size...');
          // Try once more with a larger page size
          this.pageSize = 200;
          this.loadProperties(true);
        }
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.properties = [];
        this.loading = false;
        
        if (!refresh) {
          console.log('Error loading properties. Trying again...');
          setTimeout(() => this.loadProperties(true), 1000);
        }
      }
    });
  }

  // New method to load properties with current filters
  loadPropertiesWithFilters(): void {
    const filters = this.filterForm.value;
    console.log('Loading properties with filters:', filters);
    
    // Build query parameters
    const params: PropertySearchParams = {
      page: this.currentPage,
      limit: this.pageSize,
      status: PropertyStatus.ACTIVE,
      refresh: new Date().getTime().toString() // Always add refresh parameter to bust cache
    };
    
    // Add filters to params - skip empty strings
    if (filters.listingType && filters.listingType.trim() !== '') {
      console.log('Adding listingType filter:', filters.listingType);
      params.listingType = filters.listingType;
    }
    
    if (filters.propertyType && filters.propertyType.trim() !== '') {
      console.log('Adding propertyType filter:', filters.propertyType);
      params.propertyType = filters.propertyType;
    }
    
    if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
      console.log('Adding minPrice filter:', filters.minPrice);
      params.minPrice = parseFloat(filters.minPrice);
    }
    
    if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
      console.log('Adding maxPrice filter:', filters.maxPrice);
      params.maxPrice = parseFloat(filters.maxPrice);
    }
    
    if (filters.minArea && !isNaN(parseFloat(filters.minArea))) {
      console.log('Adding minArea filter:', filters.minArea);
      params.minArea = parseFloat(filters.minArea);
    }
    
    if (filters.maxArea && !isNaN(parseFloat(filters.maxArea))) {
      console.log('Adding maxArea filter:', filters.maxArea);
      params.maxArea = parseFloat(filters.maxArea);
    }
    
    if (filters.bedrooms && !isNaN(parseInt(filters.bedrooms))) {
      console.log('Adding bedrooms filter:', filters.bedrooms);
      params.bedrooms = parseInt(filters.bedrooms);
    }
    
    if (filters.bathrooms && !isNaN(parseInt(filters.bathrooms))) {
      console.log('Adding bathrooms filter:', filters.bathrooms);
      params.bathrooms = parseInt(filters.bathrooms);
    }
    
    console.log('Final filter params:', params);
    
    this.loading = true;
    this.propertyService.getProperties(params).subscribe({
      next: (response) => {
        console.log('Filtered properties response:', response);
        
        // Use the filtered results from the service
        this.properties = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        
        // Display filter results even when empty
        this.loading = false;
        
        // Log the final results for debugging
        if (this.properties.length === 0) {
          console.log('No properties match the applied filters');
        } else {
          console.log(`Found ${this.properties.length} properties matching filters`);
          console.log('Properties:', this.properties.map(p => ({
            id: p.id,
            title: p.title, 
            listingType: p.listingType,
            propertyType: p.propertyType,
            price: p.price,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            area: p.area || p.squareFeet
          })));
        }
      },
      error: (error) => {
        console.error('Error loading filtered properties:', error);
        this.loading = false;
        this.properties = [];
        this.totalElements = 0;
        this.totalPages = 0;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    console.log('Applying filters:', filters);
    
    // Update URL with filter parameters (for shareability and back button)
    const queryParams: any = {};
    
    if (filters.listingType && filters.listingType.trim() !== '') {
      queryParams.listingType = filters.listingType;
    }
    
    if (filters.propertyType && filters.propertyType.trim() !== '') {
      queryParams.propertyType = filters.propertyType;
    }
    
    if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
      queryParams.minPrice = filters.minPrice;
    }
    
    if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
      queryParams.maxPrice = filters.maxPrice;
    }
    
    if (filters.minArea && !isNaN(parseFloat(filters.minArea))) {
      queryParams.minArea = filters.minArea;
    }
    
    if (filters.maxArea && !isNaN(parseFloat(filters.maxArea))) {
      queryParams.maxArea = filters.maxArea;
    }
    
    if (filters.bedrooms && !isNaN(parseInt(filters.bedrooms))) {
      queryParams.bedrooms = filters.bedrooms;
    }
    
    if (filters.bathrooms && !isNaN(parseInt(filters.bathrooms))) {
      queryParams.bathrooms = filters.bathrooms;
    }
    
    // Update the URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
    
    // Load properties with filters directly
    this.loadPropertiesWithFilters();
  }

  resetFilters(): void {
    // Reset form values
    this.filterForm.reset({
      listingType: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      bedrooms: '',
      bathrooms: ''
    });
    
    // Update URL by removing filter parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    
    // Force reload properties with no filters
    this.loadProperties(true);
  }
} 