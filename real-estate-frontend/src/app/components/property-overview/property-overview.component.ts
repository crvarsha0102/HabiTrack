import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { ActivatedRoute } from '@angular/router';
import { Property, PropertyType } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';

@Component({
  selector: 'app-property-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div *ngIf="property; else loading">
          <!-- Property Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ property.title }}</h1>
            <p class="text-lg text-gray-600">{{ property.address }}
              <ng-container *ngIf="property.city">
                , {{ property.city }}
                <ng-container *ngIf="property.state">
                  , {{ property.state }}
                  <ng-container *ngIf="property.zipCode"> {{ property.zipCode }}</ng-container>
                </ng-container>
              </ng-container>
            </p>
          </div>
          
          <!-- Property Images -->
          <div class="bg-white rounded-lg shadow-card overflow-hidden mb-8">
            <img 
              [src]="property.featuredImage || (property.images && property.images.length > 0 ? property.images[0] : 'assets/images/prpty.jpg')" 
              alt="{{ property.title }}"
              class="w-full h-64 md:h-96 object-cover"
            />
          </div>
          
          <!-- Property Info -->
          <div class="grid grid-cols-1">
            <div>
              <!-- Overview -->
              <div class="bg-white rounded-lg shadow-card p-6 mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p class="text-gray-500 text-sm">Type</p>
                    <p class="font-medium">{{ property.listingType === ListingType.RENT ? 'For Rent' : 'For Sale' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Price</p>
                    <p class="font-medium text-primary-600">{{ property.listingType === ListingType.RENT ? '$' + property.price + '/month' : '$' + property.price }}</p>
                  </div>
                  <div *ngIf="property.propertyType !== 'LAND'">
                    <p class="text-gray-500 text-sm">Bedrooms</p>
                    <p class="font-medium">{{ property.bedrooms }}</p>
                  </div>
                  <div *ngIf="property.propertyType !== 'LAND'">
                    <p class="text-gray-500 text-sm">Bathrooms</p>
                    <p class="font-medium">{{ property.bathrooms }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Area</p>
                    <p class="font-medium">{{ property.squareFeet || 'Not specified' }} sqft</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Property Type</p>
                    <p class="font-medium">{{ formatPropertyType(property.propertyType) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Status</p>
                    <p class="font-medium">{{ formatStatus(property.status) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Furnished</p>
                    <p class="font-medium">{{ property.furnished ? 'Yes' : 'No' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Parking</p>
                    <p class="font-medium">{{ property.parking ? 'Yes' : 'No' }}</p>
                  </div>
                  <div *ngIf="property.yearBuilt">
                    <p class="text-gray-500 text-sm">Year Built</p>
                    <p class="font-medium">{{ property.yearBuilt }}</p>
                  </div>
                </div>
                
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Description</h3>
                <p class="text-gray-700">{{ property.description }}</p>
              </div>
              
              <!-- Amenities & Features -->
              <div class="bg-white rounded-lg shadow-card p-6">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
                
                <!-- Base features -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                  <div class="flex items-center" *ngIf="property.furnished">
                    <svg class="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Furnished</span>
                  </div>
                  <div class="flex items-center" *ngIf="property.parking">
                    <svg class="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Parking Available</span>
                  </div>
                </div>
                
                <!-- Custom amenities -->
                <div *ngIf="parsedAmenities.length > 0" class="mt-4">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Additional Amenities</h3>
                  <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <li *ngFor="let amenity of parsedAmenities" class="flex items-center">
                      <svg class="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span>{{ amenity }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- Show message if no additional amenities -->
                <p *ngIf="!property.furnished && !property.parking && parsedAmenities.length === 0" class="text-gray-500">No amenities listed for this property.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <ng-template #loading>
          <div class="flex justify-center items-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-xl text-gray-600 mt-4">Loading property details...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class PropertyOverviewComponent implements OnInit {
  property: Property | null = null;
  loading = true;
  parsedAmenities: string[] = [];
  PropertyType = PropertyType;
  ListingType = ListingType;
  
  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProperty(+id);
      } else {
        this.loading = false;
      }
    });
  }
  
  loadProperty(id: number): void {
    this.loading = true;
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        if (data) {
          this.property = data;
          this.processAmenities();
        } else {
          console.error('Property not found');
          this.property = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading property details', error);
        this.property = null;
        this.loading = false;
      }
    });
  }
  
  processAmenities(): void {
    this.parsedAmenities = [];
    if (this.property) {
      // Handle string amenities (comma-separated)
      if (typeof this.property.amenities === 'string') {
        const amenitiesStr = this.property.amenities as unknown as string;
        if (amenitiesStr && amenitiesStr.trim() !== '') {
          this.parsedAmenities = amenitiesStr.split(',').map(item => item.trim()).filter(Boolean);
        }
      } 
      // Handle array amenities
      else if (Array.isArray(this.property.amenities)) {
        this.parsedAmenities = this.property.amenities.filter(Boolean);
      }
      
      // Include features if available and not already in amenities
      if (Array.isArray(this.property.features)) {
        const uniqueFeatures = this.property.features.filter(
          feature => feature && !this.parsedAmenities.includes(feature)
        );
        this.parsedAmenities = [...this.parsedAmenities, ...uniqueFeatures];
      }
    }
  }
  
  formatPropertyType(type: string): string {
    if (!type) return 'Not specified';
    
    // Convert enum value to readable format (e.g., SINGLE_FAMILY to Single Family)
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }
  
  formatStatus(status: string): string {
    if (!status) return 'Not specified';
    
    // Convert status to readable format (e.g., ACTIVE to Active)
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
} 