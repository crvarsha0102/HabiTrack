import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, PropertyType } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { PropertyStatus } from '../../models/property-status.enum';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Edit Property</h1>
        
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        
        <div *ngIf="!isLoading && propertyForm" class="bg-white rounded-lg shadow-card p-6">
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
              <label for="yearBuilt" class="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
              <input 
                type="number" 
                id="yearBuilt" 
                formControlName="yearBuilt" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Year Built"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Property Images</label>
              <!-- Show existing images -->
              <div *ngIf="existingImages.length > 0" class="grid grid-cols-3 gap-4 mb-4">
                <div *ngFor="let image of existingImages; let i = index" class="relative">
                  <img [src]="image" alt="Property image" class="h-24 w-full object-cover rounded-md">
                  <button 
                    type="button" 
                    (click)="removeExistingImage(i)" 
                    class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    ×
                  </button>
                </div>
              </div>
              
              <!-- Upload new images -->
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload new images</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" multiple accept="image/jpeg,image/png" (change)="onFileSelected($event)">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              <!-- Show selected files -->
              <div *ngIf="selectedFiles.length > 0" class="mt-2">
                <p class="text-sm text-gray-500">New images selected: {{ selectedFiles.length }}</p>
              </div>
            </div>
            
            <div class="pt-4 flex space-x-4">
              <button 
                type="submit" 
                class="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                [disabled]="propertyForm.invalid || !propertyForm.dirty && selectedFiles.length === 0 && removedImageIndices.length === 0"
              >
                Save Changes
              </button>
              
              <button 
                type="button" 
                (click)="cancel()" 
                class="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EditPropertyComponent implements OnInit {
  property!: Property;
  propertyForm!: FormGroup;
  isLoading = true;
  showBedBathFields = true;
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImages: string[] = [];
  removedImageIndices: number[] = [];
  PropertyType = PropertyType;
  ListingType = ListingType;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      console.log('Route params:', params);
      const idParam = params.get('id');
      console.log('ID parameter from route:', idParam, 'Type:', typeof idParam);
      
      if (!idParam) {
        console.error('No ID parameter found in route');
        this.showError('Missing property ID');
        return;
      }
      
      // Convert string ID to number
      const id = parseInt(idParam);
      if (isNaN(id)) {
        console.error('Invalid ID parameter in route:', idParam);
        this.showError('Invalid property ID');
        return;
      }
      
      console.log('Parsed ID:', id, 'Type:', typeof id);
      this.loadProperty(id);
    });
  }
  
  loadProperty(id: number): void {
    this.isLoading = true;
    console.log(`EditPropertyComponent: Loading property with ID ${id} (type: ${typeof id})`);
    
    // First try to get the property directly
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        console.log('Property loaded successfully:', property);
        
        if (!property) {
          console.error('Property data is empty');
          this.showError('Property not found');
          return;
        }
        
        this.property = property;
        this.existingImages = [...(property.images || [])];
        this.initForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.showError('Failed to load property: ' + error.message);
      }
    });
  }
  
  initForm(): void {
    // Check if the current user is the owner
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id !== this.property.ownerId) {
      this.router.navigate(['/my-properties']);
      return;
    }
    
    this.propertyForm = this.fb.group({
      title: [this.property.title, Validators.required],
      propertyType: [this.property.propertyType, Validators.required],
      listingType: [this.property.listingType, Validators.required],
      price: [this.property.price, [Validators.required, Validators.min(1)]],
      address: [this.property.address, Validators.required],
      city: [this.property.city, Validators.required],
      state: [this.property.state, Validators.required],
      zipCode: [this.property.zipCode, Validators.required],
      squareFeet: [this.property.squareFeet, [Validators.required, Validators.min(1)]],
      bedrooms: [this.property.bedrooms, [Validators.required, Validators.min(0)]],
      bathrooms: [this.property.bathrooms, [Validators.required, Validators.min(0)]],
      description: [this.property.description, Validators.required],
      amenities: [this.property.amenities?.join(', ') || ''],
      yearBuilt: [this.property.yearBuilt, [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]]
    });
    
    this.onPropertyTypeChange();
  }
  
  onPropertyTypeChange(): void {
    const propertyType = this.propertyForm?.get('propertyType')?.value;
    this.showBedBathFields = propertyType !== PropertyType.LAND;
    
    if (!this.showBedBathFields) {
      // When LAND is selected, set bedrooms and bathrooms to 0
      this.propertyForm.patchValue({
        bedrooms: 0,
        bathrooms: 0
      });
    }
  }
  
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      
      // Create image preview URLs
      this.imagePreviewUrls = [];
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviewUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
      
      // Mark form as dirty since we have new files
      this.propertyForm.markAsDirty();
    }
  }
  
  removeExistingImage(index: number): void {
    this.removedImageIndices.push(index);
    this.existingImages = this.existingImages.filter((_, i) => !this.removedImageIndices.includes(i));
    this.propertyForm.markAsDirty();
  }
  
  onSubmit(): void {
    if (this.propertyForm.invalid) return;
    
    const formValue = this.propertyForm.value;
    let amenitiesArray: string[] = [];
    
    if (formValue.amenities && typeof formValue.amenities === 'string') {
      amenitiesArray = formValue.amenities
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    // Combine existing images (minus removed ones) with new images
    const updatedImages = [
      ...this.existingImages,
      ...this.imagePreviewUrls
    ];
    
    const updatedProperty: Property = {
      ...this.property,
      ...formValue,
      amenities: amenitiesArray,
      features: amenitiesArray, // Using amenities as features as well
      images: updatedImages,
      featuredImage: updatedImages.length > 0 ? updatedImages[0] : undefined,
    };
    
    this.propertyService.updateProperty(this.property.id!, updatedProperty).subscribe({
      next: (property) => {
        this.router.navigate(['/my-properties']);
      },
      error: (error) => {
        console.error('Error updating property:', error);
        this.showErrorMessage(`Error updating property: ${error.message || 'Unknown error'}`);
      }
    });
  }
  
  /**
   * Shows an error message to the user
   */
  private showErrorMessage(message: string): void {
    // Simple alert for now, but could be replaced with a toast or other UI component
    alert(message);
  }
  
  cancel(): void {
    this.router.navigate(['/my-properties']);
  }
  
  // Helper method to show errors
  private showError(message: string): void {
    alert(message);
    this.isLoading = false;
    this.router.navigate(['/my-properties']);
  }
} 