import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Property, PropertySearchParams } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { PropertyStatus } from '../../models/property-status.enum';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.css']
})
export class MyPropertiesComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  ListingType = ListingType;
  PropertyStatus = PropertyStatus;
  
  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Always get fresh data when component initializes
    this.refreshProperties();
  }
  
  // Explicit refresh method that bypasses any caching
  refreshProperties(): void {
    console.log('Explicitly refreshing my properties');
    this.loadProperties(true);
  }
  
  // Modified loadProperties method with refresh flag
  loadProperties(forceRefresh: boolean = false): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.loading = false;
      console.log('No current user found, cannot load properties');
      return;
    }

    console.log('Loading properties for user:', currentUser.email);

    // Create search params for pagination
    const params: PropertySearchParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add refresh timestamp to bust any caching
    if (forceRefresh) {
      params.refresh = new Date().getTime().toString();
    }

    // Use the dedicated endpoint for user listings
    this.propertyService.getUserListings(params).subscribe({
      next: (response) => {
        console.log('Properties loaded successfully:', response);
        
        if (response && response.content) {
          this.properties = response.content;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
        } else {
          console.warn('Response format unexpected:', response);
          this.properties = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        // Set empty values on error to prevent UI issues
        this.properties = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
        // Show user-friendly error
        alert('Could not load your properties. Please try again later.');
      }
    });
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProperties();
  }
  
  updatePropertyStatus(propertyId: number, status: PropertyStatus): void {
    this.propertyService.updatePropertyStatus(propertyId, status).subscribe({
      next: () => {
        this.loadProperties();
      },
      error: (error) => {
        console.error('Error updating property status:', error);
      }
    });
  }
  
  deleteProperty(propertyId: number): void {
    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyService.deleteProperty(propertyId).subscribe({
        next: () => {
          this.loadProperties();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
        }
      });
    }
  }

  // Add this new method to handle clicking the edit link
  editProperty(property: Property): void {
    console.log('Edit property clicked for property:', property);
    console.log('Property ID:', property.id, 'Type:', typeof property.id);
    
    if (!property.id) {
      console.error('Property ID is null or undefined');
      alert('Cannot edit property: Missing property ID');
      return;
    }
    
    // Make sure the ID is a number for the router navigation
    let propertyId = property.id;
    if (typeof propertyId === 'string') {
      propertyId = parseInt(propertyId);
      if (isNaN(propertyId)) {
        console.error('Property ID is not a valid number', property.id);
        alert('Cannot edit property: Invalid property ID');
        return;
      }
    }
    
    // Navigate programmatically to ensure we have control over the process
    this.router.navigate(['/edit-property', propertyId]).then(success => {
      console.log('Navigation result:', success ? 'Success' : 'Failed');
      if (!success) {
        alert('Navigation to edit property failed');
      }
    }).catch(error => {
      console.error('Navigation error:', error);
      alert('Error navigating to edit property');
    });
  }
} 