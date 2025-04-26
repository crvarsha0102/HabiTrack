import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyType } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { AuthService } from '../../services/auth.service';
import { PropertyStatus } from '../../models/property-status.enum';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Sell Property</h1>
        
        <div class="bg-white rounded-lg shadow-card p-6">
          <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                <input 
                  type="text" 
                  id="title" 
                  formControlName="title" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Beautiful 3 Bedroom House in Downtown"
                >
              </div>
              
              <div>
                <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  id="propertyType" 
                  formControlName="propertyType" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  (change)="onPropertyTypeChange()"
                >
                  <option value="">Select Property Type</option>
                  <option [value]="PropertyType.HOUSE">House</option>
                  <option [value]="PropertyType.APARTMENT">Apartment</option>
                  <option [value]="PropertyType.CONDO">Condo</option>
                  <option [value]="PropertyType.TOWNHOUSE">Townhouse</option>
                  <option [value]="PropertyType.LAND">Land</option>
                  <option [value]="PropertyType.COMMERCIAL">Commercial</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="listingType" class="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select 
                  id="listingType" 
                  formControlName="listingType" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Listing Type</option>
                  <option [value]="ListingType.SALE">For Sale</option>
                  <option [value]="ListingType.RENT">For Rent</option>
                </select>
              </div>
              
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    id="price" 
                    formControlName="price" 
                    class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter price"
                  >
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  id="address" 
                  formControlName="address" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Street Address"
                >
              </div>
              
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  id="city" 
                  formControlName="city" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="City"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  type="text" 
                  id="state" 
                  formControlName="state" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="State"
                >
              </div>
              
              <div>
                <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  formControlName="zipCode" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="ZIP Code"
                >
              </div>
              
              <div>
                <label for="squareFeet" class="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                <input 
                  type="number" 
                  id="squareFeet" 
                  formControlName="squareFeet" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Square Feet"
                >
              </div>
            </div>
            
            <!-- Only show these fields if property type is not LAND -->
            <div *ngIf="showBedBathFields" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input 
                  type="number" 
                  id="bedrooms" 
                  formControlName="bedrooms" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Number of Bedrooms"
                >
              </div>
              
              <div>
                <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input 
                  type="number" 
                  id="bathrooms" 
                  formControlName="bathrooms" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Number of Bathrooms"
                >
              </div>
            </div>
            
            <!-- Additional features -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="furnished" 
                  formControlName="furnished" 
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                >
                <label for="furnished" class="ml-2 block text-sm text-gray-700">Furnished</label>
              </div>
              
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="parking" 
                  formControlName="parking" 
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                >
                <label for="parking" class="ml-2 block text-sm text-gray-700">Parking Available</label>
              </div>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                id="description" 
                formControlName="description" 
                rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the property..."
              ></textarea>
            </div>
            
            <div>
              <label for="amenities" class="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
              <input 
                type="text" 
                id="amenities" 
                formControlName="amenities" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Parking, Pool, Garden"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Property Images</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload images</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" multiple accept="image/jpeg,image/png" (change)="onFileSelected($event)">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <div *ngIf="selectedFiles.length > 0" class="mt-2">
                <p class="text-sm text-gray-500">Selected files: {{ selectedFiles.length }}</p>
              </div>
            </div>
            
            <div class="pt-4">
              <button 
                type="submit" 
                class="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                [disabled]="propertyForm.invalid || !propertyForm.dirty"
              >
                List Property
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AddPropertyComponent implements OnInit {
  propertyForm: FormGroup;
  PropertyType = PropertyType;
  ListingType = ListingType;
  showBedBathFields = true;
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  currentUser: any = null;
  isSubmitting = false;
  apiUrl: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      squareFeet: ['', [Validators.required, Validators.min(0)]],
      bedrooms: ['', [Validators.required, Validators.min(0)]],
      bathrooms: ['', [Validators.required, Validators.min(0)]],
      propertyType: ['', Validators.required],
      listingType: ['', Validators.required],
      amenities: [''],
      furnished: [false],
      parking: [false],
      featuredImage: [''],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onPropertyTypeChange(): void {
    const propertyType = this.propertyForm.get('propertyType')?.value;
    this.showBedBathFields = propertyType !== PropertyType.LAND;
    
    if (!this.showBedBathFields) {
      // For LAND property type, set bedrooms and bathrooms to 0
      this.propertyForm.patchValue({
        bedrooms: 0,
        bathrooms: 0
      });
      
      // Keep the validators but pre-set the values to 0
      this.propertyForm.get('bedrooms')?.setValidators([Validators.required, Validators.min(0)]);
      this.propertyForm.get('bathrooms')?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.propertyForm.get('bedrooms')?.setValidators([Validators.required, Validators.min(0)]);
      this.propertyForm.get('bathrooms')?.setValidators([Validators.required, Validators.min(0)]);
    }
    
    this.propertyForm.get('bedrooms')?.updateValueAndValidity();
    this.propertyForm.get('bathrooms')?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.imagePreviewUrls = [];
      
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      alert('Please fill out all required fields correctly.');
      return;
    }
    
    if (this.isSubmitting) {
      return; // Prevent double submission
    }
    
    this.isSubmitting = true;
    
    // Check if user is logged in
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showErrorMessage('You must be logged in to create a property.');
      this.isSubmitting = false;
      this.router.navigate(['/login']);
      return;
    }
    
    // Check authentication token
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available.');
      
      // Try to read cookie directly
      let cookieToken = null;
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'access_token') {
          cookieToken = value;
          break;
        }
      }
      
      if (cookieToken) {
        console.log('Found token in cookies, will use that instead.');
      } else {
        this.isSubmitting = false;
        this.showErrorMessage('Authentication error. Please log in again.');
        this.authService.logout();
        this.router.navigate(['/login']);
        return;
      }
    }
    
    const formValue = this.propertyForm.value;
    
    // Prepare images - base64 encoded or URLs
    const imageUrls = this.imagePreviewUrls.length > 0 
      ? this.imagePreviewUrls 
      : ['assets/images/properties/default-property.jpg'];
    
    console.log('Form values:', formValue);
    
    // Make sure listingType is explicitly set and not empty
    const listingType = formValue.listingType || 'SALE';
    console.log('Using listing type:', listingType);
    
    // Create property data in the format expected by the backend
    const propertyData = {
      name: formValue.title,
      description: formValue.description,
      address: formValue.address,
      price: formValue.price,
      bathrooms: formValue.bathrooms,
      bedrooms: formValue.bedrooms,
      squareFeet: formValue.squareFeet,
      furnished: formValue.furnished || false,
      parking: formValue.parking || false,
      amenities: formValue.amenities || '',
      listingType: listingType, // Use explicit value
      propertyType: formValue.propertyType || PropertyType.HOUSE,
      imageUrls: imageUrls,
      status: "ACTIVE"
    };
    
    console.log('Backend format:', propertyData);
    console.log('Using token:', token ? (token.substring(0, 20) + '...') : 'No token');
    
    // Direct HTTP call to avoid any mapping issues
    this.http.post(`${this.apiUrl}/listings/create`, propertyData, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    }).subscribe({
      next: (response: any) => {
        console.log('Property created successfully:', response);
        this.isSubmitting = false;
        this.showSuccessMessage('Property listed successfully!');
        
        // Clear the form
        this.propertyForm.reset();
        this.selectedFiles = [];
        this.imagePreviewUrls = [];
        
        // Navigate to my properties page
        setTimeout(() => {
          this.router.navigate(['/my-properties']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating property:', error);
        
        if (error.error) {
          console.error('Error details:', error.error);
        }
        
        this.isSubmitting = false;
        
        if (error.status === 401) {
          // Authentication error - force re-login
          this.showErrorMessage(`Authentication error. Please login again.`);
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.showErrorMessage(`Error creating property: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      }
    });
  }

  // Helper methods to show success/error messages
  private showSuccessMessage(message: string): void {
    // Use either a snackbar library or a simple alert
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // Use either a snackbar library or a simple alert
    alert(message);
  }
}