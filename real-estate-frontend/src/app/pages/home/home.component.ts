import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Property, PropertyType } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { PropertyStatus } from '../../models/property-status.enum';
import { PropertyService } from '../../services/property.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProperties: Property[] = [];
  recentProperties: Property[] = [];
  isLoading: boolean = true;
  searchCity: string = '';
  searchMinPrice: number | null = null;
  searchMaxPrice: number | null = null;
  searchPropertyType: string = '';
  searchListingType: string = '';

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Browser-only code
    }
  }

  ngOnInit(): void {
    this.loadFeaturedProperties();
    this.loadRecentProperties();
  }

  loadFeaturedProperties(): void {
    this.propertyService.getFeaturedProperties(4).subscribe({
      next: (properties) => {
        this.featuredProperties = this.propertyService.standardizeProperties(properties);
      },
      error: (error) => {
        console.error('Error loading featured properties:', error);
        // Use mock data in case of error
        this.featuredProperties = this.propertyService.standardizeProperties(this.getMockProperties(4));
      }
    });
  }

  loadRecentProperties(): void {
    this.propertyService.getRecentProperties(8).subscribe({
      next: (properties) => {
        this.recentProperties = this.propertyService.standardizeProperties(properties);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent properties:', error);
        // Use mock data in case of error
        this.recentProperties = this.propertyService.standardizeProperties(this.getMockProperties(8));
        this.isLoading = false;
      }
    });
  }

  search(): void {
    const searchParams: any = {};
    
    if (this.searchCity) {
      searchParams.city = this.searchCity;
    }
    
    if (this.searchMinPrice) {
      searchParams.minPrice = this.searchMinPrice;
    }
    
    if (this.searchMaxPrice) {
      searchParams.maxPrice = this.searchMaxPrice;
    }
    
    if (this.searchPropertyType) {
      searchParams.propertyType = this.searchPropertyType;
    }
    
    if (this.searchListingType) {
      searchParams.listingType = this.searchListingType;
    }
    
    this.router.navigate(['/properties'], { queryParams: searchParams });
  }

  private getMockProperties(count: number): Property[] {
    const mockProperties: Property[] = [];
    
    for (let i = 1; i <= count; i++) {
      mockProperties.push({
        id: i,
        title: `Beautiful ${i % 2 === 0 ? 'House' : 'Apartment'} ${i}`,
        description: 'This is a beautiful property with modern amenities.',
        price: 200000 + (i * 50000),
        address: `${123 + i} Main Street`,
        city: 'Cityville',
        state: 'ST',
        zipCode: '12345',
        bedrooms: (i % 3) + 2,
        bathrooms: (i % 2) + 1,
        squareFeet: 1500 + (i * 100),
        yearBuilt: 2010 + (i % 10),
        propertyType: i % 2 === 0 ? PropertyType.HOUSE : PropertyType.APARTMENT,
        listingType: i % 3 === 0 ? ListingType.RENT : ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        featuredImage: `/assets/images/property-${(i % 5) + 1}.jpg`,
        images: [
          `/assets/images/property-${(i % 5) + 1}.jpg`,
          `/assets/images/property-${((i + 1) % 5) + 1}.jpg`,
          `/assets/images/property-${((i + 2) % 5) + 1}.jpg`
        ],
        amenities: ['Air Conditioning', 'Parking', 'Gym', 'Swimming Pool'],
        features: ['Spacious Rooms', 'Modern Design', 'Good Location'],
        ownerId: i
      });
    }
    
    return mockProperties;
  }
} 