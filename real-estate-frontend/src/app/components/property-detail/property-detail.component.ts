import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { ActivatedRoute } from '@angular/router';
import { Property, ListingType, PropertyType } from '../../models/property.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FavoriteButtonComponent, ReactiveFormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <div *ngIf="property; else loading">
          <!-- Property Header -->
          <div class="mb-6 flex justify-between items-start">
            <div>
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
            <div>
              <app-favorite-button [listingId]="property.id"></app-favorite-button>
            </div>
          </div>
          
          <!-- Property Images Carousel -->
          <div class="bg-white rounded-lg shadow-card overflow-hidden mb-8 relative">
            <div class="relative h-64 md:h-96">
              <img 
                *ngFor="let image of property.images; let i = index"
                [src]="image" 
                alt="{{ property.title }} - Image {{ i + 1 }}"
                class="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                [ngClass]="{'opacity-100': currentImageIndex === i, 'opacity-0': currentImageIndex !== i}"
              />
              
              <!-- Image count indicator -->
              <div *ngIf="property.images.length > 1" class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {{ currentImageIndex + 1 }} / {{ property.images.length }}
              </div>
            </div>
            
            <!-- Navigation Arrows -->
            <button 
              *ngIf="property.images.length > 1"
              (click)="prevImage()" 
              class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              *ngIf="property.images.length > 1"
              (click)="nextImage()" 
              class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <!-- Thumbnail Navigation (optional) -->
            <div *ngIf="property.images.length > 1" class="flex justify-center mt-2 p-2 bg-gray-100">
              <div 
                *ngFor="let image of property.images; let i = index" 
                (click)="setCurrentImage(i)"
                class="h-16 w-16 mx-1 rounded-md overflow-hidden cursor-pointer border-2 transition-all"
                [ngClass]="{'border-primary-500': currentImageIndex === i, 'border-transparent': currentImageIndex !== i}"
              >
                <img [src]="image" alt="Thumbnail" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>
          
          <!-- Property Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
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
                  <div>
                    <p class="text-gray-500 text-sm">Area</p>
                    <p class="font-medium">{{ property.squareFeet || 'Not specified' }} sqft</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Property Type</p>
                    <p class="font-medium">{{ property.propertyType }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Status</p>
                    <p class="font-medium">{{ property.status }}</p>
                  </div>
                  <!-- Only show bedroom/bathroom info for non-LAND properties -->
                  <div *ngIf="property.propertyType !== 'LAND'">
                    <p class="text-gray-500 text-sm">Bedrooms</p>
                    <p class="font-medium">{{ property.bedrooms }}</p>
                  </div>
                  <div *ngIf="property.propertyType !== 'LAND'">
                    <p class="text-gray-500 text-sm">Bathrooms</p>
                    <p class="font-medium">{{ property.bathrooms }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Furnished</p>
                    <p class="font-medium">{{ property.furnished ? 'Yes' : 'No' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">Parking</p>
                    <p class="font-medium">{{ property.parking ? 'Yes' : 'No' }}</p>
                  </div>
                </div>
                
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Description</h3>
                <p class="text-gray-700">{{ property.description }}</p>
              </div>
              
              <!-- Amenities -->
              <div class="bg-white rounded-lg shadow-card p-6">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <!-- Custom amenities from the backend -->
                  <div *ngFor="let amenity of property.amenities" class="flex items-center">
                    <svg class="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ amenity }}</span>
                  </div>
                </div>
                <p *ngIf="!property.furnished && !property.parking && (!property.amenities || property.amenities.length === 0)" class="text-gray-500 mt-4">No additional features listed for this property.</p>
              </div>
            </div>
            
            <!-- Contact Agent Form - Always visible now -->
            <div class="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 class="text-xl font-semibold mb-4">Contact Agent</h3>
              
              <!-- Loading indicator for agent info -->
              <div *ngIf="loadingAgentInfo" class="mb-4 flex items-center">
                <svg class="animate-spin h-5 w-5 text-primary-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-gray-600">Loading agent information...</span>
              </div>
              
              <!-- Agent information display -->
              <div class="mb-4 p-3 bg-gray-50 rounded-md" *ngIf="!loadingAgentInfo && agentName">
                <div class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">{{ agentName }}</p>
                    <p *ngIf="agentPhone" class="text-sm text-gray-600 flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ agentPhone }}
                    </p>
                    <p *ngIf="agentEmail" class="text-sm text-gray-600 flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ agentEmail }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div *ngIf="contactSuccess" class="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
                Your message has been sent successfully. The agent will contact you soon.
              </div>
              
              <div *ngIf="contactError" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
                {{ contactError }}
              </div>
              
              <form [formGroup]="contactForm" (ngSubmit)="submitContactForm()" *ngIf="!contactSuccess">
                <div class="mb-4">
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    formControlName="name"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    [ngClass]="{'border-red-300': contactSubmitted && contactForm.get('name')?.invalid}"
                  />
                  <div *ngIf="contactSubmitted && contactForm.get('name')?.errors" class="mt-1 text-sm text-red-600">
                    Name is required
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    [ngClass]="{'border-red-300': contactSubmitted && contactForm.get('email')?.invalid}"
                  />
                  <div *ngIf="contactSubmitted && contactForm.get('email')?.errors" class="mt-1 text-sm text-red-600">
                    <span *ngIf="contactForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="contactForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    formControlName="phone"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    [ngClass]="{'border-red-300': contactSubmitted && contactForm.get('phone')?.invalid}"
                  />
                  <div *ngIf="contactSubmitted && contactForm.get('phone')?.errors?.['pattern']" class="mt-1 text-sm text-red-600">
                    Please enter a valid phone number
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    formControlName="message"
                    rows="4"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    [ngClass]="{'border-red-300': contactSubmitted && contactForm.get('message')?.invalid}"
                  ></textarea>
                  <div *ngIf="contactSubmitted && contactForm.get('message')?.errors" class="mt-1 text-sm text-red-600">
                    <span *ngIf="contactForm.get('message')?.errors?.['required']">Message is required</span>
                    <span *ngIf="contactForm.get('message')?.errors?.['minlength']">Message must be at least 10 characters</span>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <button 
                    type="submit" 
                    class="w-full bg-primary-600 text-white font-medium py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex justify-center items-center"
                    [disabled]="contactSubmitting"
                  >
                    <span *ngIf="contactSubmitting" class="mr-2">
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    {{ contactSubmitting ? 'Sending...' : 'Send Message' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Loading State -->
        <ng-template #loading>
          <div class="flex justify-center items-center py-16">
            <p class="text-xl text-gray-600">Loading property details...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class PropertyDetailComponent implements OnInit {
  @Input() showContactForm: boolean = true;
  @Input() property: Property | null = null;
  ListingType = ListingType;
  agentName: string | null = null;
  agentPhone: string | null = null;
  agentEmail: string | null = null;
  loadingAgentInfo: boolean = true;
  currentImageIndex: number = 0;
  contactForm!: FormGroup;
  contactSubmitted: boolean = false;
  contactSubmitting: boolean = false;
  contactSuccess: boolean = false;
  contactError: string | null = null;
  
  // Helper method to truncate long strings for logging
  private truncateForLogging(obj: any): any {
    if (!obj) return obj;
    
    // Create a deep copy to avoid modifying the original object
    const truncated = JSON.parse(JSON.stringify(obj));
    
    // Function to process object properties recursively
    const processObject = (object: any) => {
      if (!object || typeof object !== 'object') return;
      
      Object.keys(object).forEach(key => {
        const value = object[key];
        
        // If it's a string and longer than 100 characters, truncate it
        if (typeof value === 'string' && value.length > 100) {
          // Check if it's likely a base64 image
          if (value.startsWith('data:image') || /^[A-Za-z0-9+/=]{100,}$/.test(value)) {
            object[key] = value.substring(0, 50) + '... [truncated, ' + value.length + ' chars]';
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursively process nested objects
          processObject(value);
        }
      });
    };
    
    processObject(truncated);
    return truncated;
  }
  
  constructor(
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    // Initialize the contact form
    this.initContactForm();
    
    // Only load the property if it wasn't provided as an input
    if (!this.property) {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadProperty(+id);
        }
      });
    } else {
      // Ensure property has images array
      if (!this.property.images || this.property.images.length === 0) {
        this.property.images = ['assets/images/prpty.jpg'];
      }
      
      // If property is provided as an input, try to get agent info
      this.getAgentInfo();
    }
  }
  
  initContactForm(): void {
    // Create a form group with validation
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('[0-9]{10,15}')],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    
    // Pre-fill form if user is logged in
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.contactForm.patchValue({
          name: currentUser.firstName && currentUser.lastName ? 
            `${currentUser.firstName} ${currentUser.lastName}` : 
            currentUser.username || '',
          email: currentUser.email || ''
        });
      }
    }
  }
  
  submitContactForm(): void {
    this.contactSubmitted = true;
    
    if (this.contactForm.invalid) {
      return;
    }
    
    this.contactSubmitting = true;
    this.contactSuccess = false;
    this.contactError = null;
    
    // Get current user to use as sender
    const currentUser = this.authService.getCurrentUser();
    
    // Determine the recipient ID
    const recipientId = this.property?.ownerId || this.property?.userId;
    
    console.log('Property owner data:', {
      ownerId: this.property?.ownerId,
      userId: this.property?.userId,
      ownerName: this.property?.ownerName,
      contactEmail: this.property?.contactEmail
    });
    
    if (!recipientId) {
      this.contactError = 'Unable to determine the property owner. Please try again later.';
      this.contactSubmitting = false;
      return;
    }
    
    // Ensure the ID is a number before sending to the backend
    const numericRecipientId = typeof recipientId === 'string' ? parseInt(recipientId, 10) : recipientId;
    
    if (isNaN(numericRecipientId) || numericRecipientId <= 0) {
      this.contactError = 'Invalid recipient ID. Please try again later.';
      this.contactSubmitting = false;
      console.error('Invalid recipient ID:', recipientId);
      return;
    }
    
    // Check if the user is logged in
    if (!currentUser || !currentUser.id) {
      this.contactError = 'You must be logged in to send messages.';
      this.contactSubmitting = false;
      return;
    }
    
    // Send the message to backend
    const formDataWithMessage = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone || '',
      message: this.contactForm.value.message,
      propertyId: this.property?.id,
      recipientId: numericRecipientId,
      senderId: currentUser.id,
      subject: `Inquiry about property: ${this.property?.title || this.property?.id}`
    };
    
    console.log('Sending contact message with data:', this.truncateForLogging(formDataWithMessage));
    
    // Check if all required fields are present
    if (!formDataWithMessage.message || !formDataWithMessage.propertyId || !formDataWithMessage.recipientId || !formDataWithMessage.senderId) {
      this.contactError = 'Missing required information. Please try again later.';
      this.contactSubmitting = false;
      console.error('Missing required fields:', { 
        message: formDataWithMessage.message,
        propertyId: formDataWithMessage.propertyId,
        recipientId: formDataWithMessage.recipientId,
        senderId: formDataWithMessage.senderId
      });
      return;
    }
    
    // Send the message to backend
    this.http.post<any>(`${environment.apiUrl}/messages/contact`, formDataWithMessage)
      .subscribe({
        next: (response) => {
          this.contactSubmitting = false;
          this.contactSuccess = true;
          this.contactForm.reset();
          this.contactSubmitted = false;
        },
        error: (error) => {
          this.contactSubmitting = false;
          
          // Try to extract a meaningful error message
          if (error.error && error.error.message) {
            this.contactError = error.error.message;
          } else if (error.status === 500) {
            this.contactError = 'Server error. The system cannot process your message at this time.';
          } else {
            this.contactError = 'Failed to send your message. Please try again later.';
          }
          
          console.error('Error sending contact message:', error);
        }
      });
  }
  
  loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        if (data) {
          this.property = data;
          
          // Make sure we have at least one image
          if (!this.property.images || this.property.images.length === 0) {
            this.property.images = ['assets/images/prpty.jpg'];
          }
          
          // Ensure property type is handled correctly
          if (this.property.propertyType) {
            console.log('Loaded property with type:', this.property.propertyType);
            
            // For LAND property type, set default values for residential properties
            if (this.property.propertyType === PropertyType.LAND) {
              // These are not relevant for land, ensure they're explicitly zero/null
              if (!this.property.bedrooms) this.property.bedrooms = 0;
              if (!this.property.bathrooms) this.property.bathrooms = 0;
            }
          } else {
            console.warn('Property has no property type, defaulting to:', PropertyType.HOUSE);
            this.property.propertyType = PropertyType.HOUSE;
          }
          
          // Try to get the user information from the backend
          this.getAgentInfo();
        } else {
          console.error('Property not found');
          // Handle property not found case
        }
      },
      error: (error) => {
        console.error('Error loading property details', error);
      }
    });
  }
  
  getAgentInfo(): void {
    if (!this.property) {
      this.loadingAgentInfo = false;
      console.error('Cannot get agent info: Property is null or undefined');
      return;
    }
    
    console.log('Getting agent info for property:', this.truncateForLogging(this.property));
    
    // Check if we already have owner data in the property
    if (this.property.ownerName || this.property.contactEmail || this.property.contactPhone) {
      this.agentName = this.property.ownerName || 'Property Owner';
      this.agentPhone = this.property.contactPhone || null;
      this.agentEmail = this.property.contactEmail || null;
      this.loadingAgentInfo = false;
      console.log('Using existing agent info:', { name: this.agentName, phone: this.agentPhone, email: this.agentEmail });
      return;
    }
    
    // If no ownerId or userId, we can't fetch agent info
    if (!this.property.ownerId && !this.property.userId) {
      console.error('No owner ID available for property:', this.truncateForLogging(this.property));
      this.agentName = 'Property Owner';  // Default to a generic name instead of 'Unknown'
      this.loadingAgentInfo = false;
      return;
    }
    
    // Determine which ID to use
    const ownerId = this.property.ownerId || this.property.userId;
    console.log('Using owner ID for agent info:', ownerId);
    
    // Get the user data from backend using the public endpoint
    const apiUrl = `${environment.apiUrl}/users/public/${ownerId}`;
    
    console.log('Fetching agent info from:', apiUrl);
    
    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        console.log('Agent info response:', this.truncateForLogging(response));
        if (response && response.success && response.data) {
          const user = response.data;
          
          // Generate a proper agent name from available user data
          let name = '';
          if (user.firstName || user.lastName) {
            name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          }
          if (!name && user.username) {
            name = user.username;
          }
          this.agentName = name || 'Property Owner';
          
          this.agentPhone = user.phone || null;
          this.agentEmail = user.email || null;
          
          // Save this information in the property object for future reference
          if (this.property) {
            this.property.ownerName = this.agentName;
            this.property.contactPhone = this.agentPhone ? this.agentPhone : undefined;
            this.property.contactEmail = this.agentEmail ? this.agentEmail : undefined;
          }
          
          console.log('Loaded agent information:', { name: this.agentName, phone: this.agentPhone, email: this.agentEmail });
        } else {
          console.error('Unable to parse agent data from response:', response);
          this.agentName = 'Property Owner';
        }
        this.loadingAgentInfo = false;
      },
      error: (error) => {
        console.error('Error fetching agent information:', error);
        this.agentName = 'Property Owner';
        this.loadingAgentInfo = false;
      }
    });
  }

  prevImage(): void {
    if (this.property && this.property.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.property.images.length) % this.property.images.length;
    }
  }

  nextImage(): void {
    if (this.property && this.property.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.property.images.length;
    }
  }

  setCurrentImage(index: number): void {
    if (this.property && this.property.images.length > 1) {
      this.currentImageIndex = index;
    }
  }
} 