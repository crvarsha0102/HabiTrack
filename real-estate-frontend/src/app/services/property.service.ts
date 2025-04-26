import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Property, PropertyType, PropertySearchParams, PropertyResponse } from '../models/property.model';
import { ListingType } from '../models/listing-type.enum';
import { PropertyStatus } from '../models/property-status.enum';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/listings`;
  private isBrowser: boolean;
  private useMockData = false; // Use the real backend API
  
  // Empty array for fallback if needed
  private dummyProperties: Property[] = [];

  // At the top of the class after the private variables
  private lastPropertyUpdateTime: number = 0;

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
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('PropertyService initialized. Using mock data:', this.useMockData);
    console.log('API URL:', this.apiUrl);
    
    // Load user properties from localStorage on initialization
    if (this.isBrowser) {
      this.loadUserProperties();
      this.loadAllSavedProperties();
      
      // Subscribe to auth changes to reload properties
      this.authService.currentUser$.subscribe(user => {
        console.log('Auth state changed, current user:', user);
        if (user && user.id !== undefined) {
          console.log('Loading properties for user:', user.id);
          this.loadUserPropertiesById(user.id);
          this.loadAllPublicProperties();
        } else {
          console.log('No user logged in, loading all public properties');
          this.loadAllPublicProperties();
        }
      });
      
      // Listen for new user registrations
      this.authService.userRegistered$.subscribe(user => {
        if (user && user.id !== undefined) {
          // Initialize an empty properties list for the new user
          this.saveUserPropertiesById(user.id);
        }
      });
    }
  }
  
  // Method to mark properties as updated
  private markPropertiesUpdated(): void {
    this.lastPropertyUpdateTime = new Date().getTime();
    console.log('Properties marked as updated at:', this.lastPropertyUpdateTime);
  }
  
  // Load all saved properties from localStorage across all users
  private loadAllSavedProperties(): void {
    if (!this.isBrowser) return;
    
    try {
      // Get a list of all user property keys
      const propertyKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('user_properties_')
      );
      
      // Load each user's properties
      propertyKeys.forEach(key => {
        const userPropertiesJson = localStorage.getItem(key);
        if (userPropertiesJson) {
          const userProperties = JSON.parse(userPropertiesJson);
          
          // Filter out any duplicates based on ID
          const propertyIds = this.dummyProperties.map(p => p.id);
          const filteredProperties = userProperties.filter(
            (p: Property) => !propertyIds.includes(p.id)
          );
          
          // Add to the main properties array
          this.dummyProperties = [...this.dummyProperties, ...filteredProperties];
        }
      });
    } catch (error) {
      console.error('Error loading all saved properties:', error);
    }
  }
  
  // New method to save user properties to localStorage
  private saveUserProperties(): void {
    if (!this.isBrowser) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.id === undefined) return;
    
    this.saveUserPropertiesById(currentUser.id);
  }
  
  // Save properties for a specific user ID
  private saveUserPropertiesById(userId: number | undefined): void {
    if (!this.isBrowser || userId === undefined) return;
    
    // Get only properties created by this user
    const userProperties = this.dummyProperties.filter(p => 
      p.ownerId === userId && 
      (p.id !== undefined && p.id < 9000) // Exclude demo properties with null check
    );
    
    try {
      localStorage.setItem(`user_properties_${userId}`, JSON.stringify(userProperties));
    } catch (error) {
      console.error(`Error saving properties for user ${userId}:`, error);
    }
  }
  
  // Load properties for the current user
  private loadUserProperties(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.id === undefined) return;
    
    console.log('Loading properties for user:', currentUser.id);
    this.loadUserPropertiesById(currentUser.id);
    
    // Also load public properties from other users
    this.loadAllPublicProperties();
  }
  
  // Load properties for a specific user ID
  private loadUserPropertiesById(userId: number | undefined): void {
    if (!this.isBrowser || userId === undefined) return;
    
    try {
      const userPropertiesJson = localStorage.getItem(`user_properties_${userId}`);
      if (userPropertiesJson) {
        const userProperties = JSON.parse(userPropertiesJson);
        
        // Remove existing user properties from the array (keeping demo properties)
        this.dummyProperties = this.dummyProperties.filter(p => 
          p.ownerId !== userId || 
          (p.id !== undefined && p.id >= 9000) // Keep demo properties with null check
        );
        
        // Add user properties back
        this.dummyProperties = [...userProperties, ...this.dummyProperties];
      }
    } catch (error) {
      console.error(`Error loading properties for user ${userId}:`, error);
    }
  }
  
  // Load public properties from all users (ACTIVE status) from localStorage
  private loadAllPublicProperties(): void {
    if (!this.isBrowser) return;
    
    try {
      console.log('Loading public properties from all users');
      
      // Get a list of all user property keys
      const propertyKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('user_properties_')
      );
      
      console.log('Found property keys:', propertyKeys);
      
      // Current user ID to exclude their properties (which are already loaded)
      const currentUser = this.authService.getCurrentUser();
      const currentUserId = currentUser?.id;
      
      // Load each user's properties that have ACTIVE status
      propertyKeys.forEach(key => {
        // Skip current user's properties since they're already loaded
        const userId = parseInt(key.replace('user_properties_', ''));
        if (userId === currentUserId) return;
        
        const userPropertiesJson = localStorage.getItem(key);
        if (userPropertiesJson) {
          const userProperties = JSON.parse(userPropertiesJson);
          console.log(`Loaded ${userProperties.length} properties for user ${userId}`);
          
          // Only include ACTIVE properties from other users
          const activeProperties = userProperties.filter(
            (p: Property) => p.status === PropertyStatus.ACTIVE
          );
          
          console.log(`Found ${activeProperties.length} active properties for user ${userId}`);
          
          // Filter out any duplicates based on ID
          const propertyIds = this.dummyProperties.map(p => p.id);
          const filteredProperties = activeProperties.filter(
            (p: Property) => !propertyIds.includes(p.id)
          );
          
          console.log(`Adding ${filteredProperties.length} new properties from user ${userId}`);
          
          // Add to the main properties array
          this.dummyProperties = [...this.dummyProperties, ...filteredProperties];
        }
      });
      
      console.log(`Total properties after loading public properties: ${this.dummyProperties.length}`);
    } catch (error) {
      console.error('Error loading public properties:', error);
    }
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  getProperties(params: PropertySearchParams = {}): Observable<PropertyResponse> {
    console.log('Getting properties with params:', JSON.stringify(params));
    
    // Create HttpParams object for query parameters
    let httpParams = new HttpParams();
    
    // Add optional parameters if they exist
    if (params.page !== undefined) {
      httpParams = httpParams.set('startIndex', String(params.page * (params.limit || 10)));
    }
    
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    
    if (params.status !== undefined) {
      httpParams = httpParams.set('status', params.status);
    }
    
    if (params.search !== undefined && params.search.trim() !== '') {
      httpParams = httpParams.set('searchTerm', params.search.trim());
    }
    
    // Add listing type filter explicitly
    if (params.listingType !== undefined && params.listingType !== '') {
      console.log('Adding listingType filter:', params.listingType);
      httpParams = httpParams.set('listingType', params.listingType);
    }
    
    // Add property type filter explicitly
    if (params.propertyType !== undefined && params.propertyType !== '') {
      console.log('Adding propertyType filter:', params.propertyType);
      httpParams = httpParams.set('propertyType', params.propertyType);
    }
    
    // Add price range filters explicitly
    if (params.minPrice !== undefined && params.minPrice > 0) {
      console.log('Adding minPrice filter:', params.minPrice);
      httpParams = httpParams.set('minPrice', String(params.minPrice));
    }
    
    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      console.log('Adding maxPrice filter:', params.maxPrice);
      httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    }
    
    // Add bedroom and bathroom filters
    if (params.bedrooms !== undefined && params.bedrooms > 0) {
      console.log('Adding bedrooms filter:', params.bedrooms);
      httpParams = httpParams.set('bedrooms', String(params.bedrooms));
    }
    
    if (params.bathrooms !== undefined && params.bathrooms > 0) {
      console.log('Adding bathrooms filter:', params.bathrooms);
      httpParams = httpParams.set('bathrooms', String(params.bathrooms));
    }
    
    // Add area filters
    if (params.minArea !== undefined && params.minArea > 0) {
      console.log('Adding minArea filter:', params.minArea);
      httpParams = httpParams.set('minArea', String(params.minArea));
    }
    
    if (params.maxArea !== undefined && params.maxArea > 0) {
      console.log('Adding maxArea filter:', params.maxArea);
      httpParams = httpParams.set('maxArea', String(params.maxArea));
    }
    
    // Add refresh parameter for cache busting if needed
    if (params.refresh) {
      httpParams = httpParams.set('refresh', params.refresh);
    }
    
    // Log the final HTTP parameters for debugging
    console.log('Final HTTP params:', httpParams.toString());
    
    // WORKAROUND: First try getting all properties
    const getAllUrl = `${this.apiUrl}/get`;
    console.log('First getting ALL properties from:', getAllUrl);
    
    return this.http.get<any>(getAllUrl, { params: new HttpParams().set('refresh', new Date().getTime().toString()) }).pipe(
      tap(response => console.log('Raw ALL properties response:', response)),
      map(response => {
        console.log('Got all properties, now applying filters client-side');
        return this.processApiResponse(response, params);
      }),
      catchError(error => {
        console.error('Error fetching ALL properties:', error);
        console.log('Falling back to filtered API endpoints...');
        
        // Try both search and get endpoints with fallback
        const searchUrl = `${this.apiUrl}/search`;
        console.log('Trying API URL for filtered properties:', searchUrl);
        
        return this.http.get<any>(searchUrl, { params: httpParams }).pipe(
          tap(response => console.log('Raw API response from /search endpoint:', response)),
          map(response => this.processApiResponse(response, params)),
          catchError(error => {
            console.error('Error fetching properties from /search endpoint:', error);
            console.log('Trying fallback to /get endpoint...');
            
            // Fallback to /get endpoint if /search fails
            const getUrl = `${this.apiUrl}/get`;
            return this.http.get<any>(getUrl, { params: httpParams }).pipe(
              tap(response => console.log('Raw API response from /get endpoint:', response)),
              map(response => this.processApiResponse(response, params)),
              catchError(getError => {
                console.error('Error fetching properties from /get endpoint:', getError);
                console.log('Both API endpoints failed, falling back to client-side filtering of all properties...');
                
                // As a last resort, try to get all properties and filter them client-side
                return this.getAllPropertiesWithClientFiltering(params);
              })
            );
          })
        );
      })
    );
  }
  
  // Helper method to process API response consistently
  private processApiResponse(response: any, params: PropertySearchParams): PropertyResponse {
    console.log('Processing API response:', response);
    
    let properties: Property[] = [];
    let totalElements = 0;
    
    if (response && response.success === true) {
      // Handle different response structures
      if (response.listings && Array.isArray(response.listings)) {
        console.log('Found listings array with', response.listings.length, 'items');
        properties = [...response.listings].map(listing => this.mapBackendToFrontend(listing));
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Found data array with', response.data.length, 'items');
        properties = [...response.data].map(listing => this.mapBackendToFrontend(listing));
      } else {
        console.warn('No listings or data array found in API response');
        // Check if the response itself is an array (some APIs might return array directly)
        if (Array.isArray(response)) {
          console.log('Response is an array with', response.length, 'items');
          properties = [...response].map(listing => this.mapBackendToFrontend(listing));
        }
      }
    } else {
      console.warn('API response not successful or unexpected format');
    }
    
    console.log('Mapped properties before filtering:', properties.length);
    console.log('Filter params to apply:', JSON.stringify(params));
    
    // ALWAYS apply filters client-side to ensure correct filtering
    // Create a copy to track filtering progress
    let filteredProperties = [...properties];
    
    // If listing type filter was provided, apply it client-side
    if (params.listingType && params.listingType !== '') {
      console.log('Applying listingType filter client-side:', params.listingType);
      const before = filteredProperties.length;
      
      // Log the available listing types for debugging
      const availableTypes = [...new Set(filteredProperties.map(p => p.listingType))];
      console.log('Available listing types in data:', availableTypes);
      
      // Check if any properties match the filter exactly
      const exactMatches = filteredProperties.filter(property => 
        property.listingType === params.listingType
      );
      
      if (exactMatches.length === 0) {
        console.log('No exact matches for listingType, trying case-insensitive comparison');
        // Try case-insensitive match as fallback
        filteredProperties = filteredProperties.filter(property => {
          const propertyType = property.listingType?.toUpperCase();
          const paramType = params.listingType?.toUpperCase();
          const match = propertyType === paramType;
          console.log(`Property ${property.id} listingType: "${propertyType}" vs filter: "${paramType}" = ${match}`);
          return match;
        });
      } else {
        filteredProperties = exactMatches;
      }
      
      console.log(`After listingType filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    // If property type filter was provided, apply it client-side
    if (params.propertyType && params.propertyType !== '') {
      console.log('Applying propertyType filter client-side:', params.propertyType);
      const before = filteredProperties.length;
      
      // Log the available property types for debugging
      const availableTypes = [...new Set(filteredProperties.map(p => p.propertyType))];
      console.log('Available property types in data:', availableTypes);
      
      // Check if any properties match the filter exactly
      const exactMatches = filteredProperties.filter(property => 
        property.propertyType === params.propertyType
      );
      
      if (exactMatches.length === 0) {
        console.log('No exact matches for propertyType, trying case-insensitive comparison');
        // Try case-insensitive match as fallback
        filteredProperties = filteredProperties.filter(property => {
          const propertyType = property.propertyType?.toUpperCase();
          const paramType = params.propertyType?.toUpperCase();
          const match = propertyType === paramType;
          console.log(`Property ${property.id} propertyType: "${propertyType}" vs filter: "${paramType}" = ${match}`);
          return match;
        });
      } else {
        filteredProperties = exactMatches;
      }
      
      console.log(`After propertyType filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    // If min/max price filters were provided, apply them client-side
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const minPrice = params.minPrice !== undefined ? params.minPrice : 0;
      const maxPrice = params.maxPrice !== undefined ? params.maxPrice : Number.MAX_VALUE;
      
      console.log(`Applying price filter: $${minPrice} - $${maxPrice}`);
      const before = filteredProperties.length;
      
      // Log price range for debugging
      const priceRange = filteredProperties.length > 0 
        ? { 
            min: Math.min(...filteredProperties.map(p => p.price)),
            max: Math.max(...filteredProperties.map(p => p.price)) 
          } 
        : { min: 0, max: 0 };
      console.log('Available price range in data:', priceRange);
      
      filteredProperties = filteredProperties.filter(property => {
        const match = property.price >= minPrice && property.price <= maxPrice;
        console.log(`Property ${property.id} price: $${property.price} in range $${minPrice}-$${maxPrice} = ${match}`);
        return match;
      });
      
      console.log(`After price filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    // If bedrooms filter was provided, apply it client-side
    if (params.bedrooms !== undefined && params.bedrooms > 0) {
      console.log('Applying bedrooms filter client-side:', params.bedrooms);
      const before = filteredProperties.length;
      
      // Log available bedroom counts for debugging
      const availableBedrooms = [...new Set(filteredProperties.map(p => p.bedrooms))].sort();
      console.log('Available bedroom counts in data:', availableBedrooms);
      
      filteredProperties = filteredProperties.filter(property => {
        const match = property.bedrooms >= params.bedrooms!;
        console.log(`Property ${property.id} bedrooms: ${property.bedrooms} >= ${params.bedrooms} = ${match}`);
        return match;
      });
      
      console.log(`After bedrooms filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    // If bathrooms filter was provided, apply it client-side
    if (params.bathrooms !== undefined && params.bathrooms > 0) {
      console.log('Applying bathrooms filter client-side:', params.bathrooms);
      const before = filteredProperties.length;
      
      // Log available bathroom counts for debugging
      const availableBathrooms = [...new Set(filteredProperties.map(p => p.bathrooms))].sort();
      console.log('Available bathroom counts in data:', availableBathrooms);
      
      filteredProperties = filteredProperties.filter(property => {
        const match = property.bathrooms >= params.bathrooms!;
        console.log(`Property ${property.id} bathrooms: ${property.bathrooms} >= ${params.bathrooms} = ${match}`);
        return match;
      });
      
      console.log(`After bathrooms filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    // If area filter was provided, apply it client-side
    if (params.minArea !== undefined || params.maxArea !== undefined) {
      const minArea = params.minArea !== undefined ? params.minArea : 0;
      const maxArea = params.maxArea !== undefined ? params.maxArea : Number.MAX_VALUE;
      
      console.log(`Applying area filter: ${minArea} - ${maxArea} sq ft`);
      const before = filteredProperties.length;
      
      filteredProperties = filteredProperties.filter(property => {
        const area = property.area || property.squareFeet || 0;
        const match = area >= minArea && area <= maxArea;
        console.log(`Property ${property.id} area: ${area} sq ft in range ${minArea}-${maxArea} sq ft = ${match}`);
        return match;
      });
      
      console.log(`After area filtering: ${before} -> ${filteredProperties.length} properties`);
    }
    
    totalElements = filteredProperties.length;
    
    // Calculate total pages
    const limit = params.limit || 10;
    const totalPages = Math.ceil(totalElements / limit);
    
    const result: PropertyResponse = {
      content: filteredProperties,
      totalElements: totalElements,
      totalPages: totalPages,
      size: limit,
      number: params.page || 0
    };
    
    console.log('Final property result:', {
      contentCount: result.content.length,
      totalElements: result.totalElements,
      totalPages: result.totalPages
    });
    
    return result;
  }
  
  // New helper method to get all properties and apply filtering client-side
  private getAllPropertiesWithClientFiltering(params: PropertySearchParams): Observable<PropertyResponse> {
    console.log('Using client-side only filtering as fallback');
    
    // Create a minimal request to get all properties
    const minimalParams = new HttpParams()
      .set('limit', '1000')  // Request a large number of properties
      .set('refresh', new Date().getTime().toString());
    
    // Make a simple request to get all properties
    return this.http.get<any>(`${this.apiUrl}/get`, { params: minimalParams }).pipe(
      tap(response => console.log('Fallback: got all properties for client filtering')),
      map(response => {
        // Process the response to get all properties
        let allProperties: Property[] = [];
        
        if (response && response.success === true) {
          if (response.listings && Array.isArray(response.listings)) {
            allProperties = [...response.listings].map(listing => this.mapBackendToFrontend(listing));
          } else if (response.data && Array.isArray(response.data)) {
            allProperties = [...response.data].map(listing => this.mapBackendToFrontend(listing));
          } else if (Array.isArray(response)) {
            allProperties = [...response].map(listing => this.mapBackendToFrontend(listing));
          }
        }
        
        console.log(`Fallback: got ${allProperties.length} properties, applying filters client-side`);
        
        // Apply manual filtering using our comprehensive filter function
        return this.manuallyFilterProperties(allProperties, params);
      }),
      catchError(error => {
        console.error('Error in fallback all-properties fetch:', error);
        // Return empty result as last resort
        return of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: params.limit || 10,
          number: params.page || 0
        });
      })
    );
  }
  
  // New helper method to manually filter properties for the fallback case
  private manuallyFilterProperties(properties: Property[], params: PropertySearchParams): PropertyResponse {
    console.log(`Manually filtering ${properties.length} properties with params:`, params);
    
    // Apply all filters manually
    let filteredProperties = [...properties];
    
    // Only include ACTIVE properties unless otherwise specified
    if (params.status) {
      filteredProperties = filteredProperties.filter(p => p.status === params.status);
    } else {
      filteredProperties = filteredProperties.filter(p => p.status === PropertyStatus.ACTIVE);
    }
    
    // Apply all other filters using our comprehensive filtering
    filteredProperties = this.filterProperties(filteredProperties, params);
    
    // Calculate pagination
    const totalElements = filteredProperties.length;
    const pageSize = params.limit || 10;
    const pageIndex = params.page || 0;
    const totalPages = Math.ceil(totalElements / pageSize);
    
    // If pagination is requested, slice the array
    const start = pageIndex * pageSize;
    const paginatedProperties = filteredProperties.slice(start, start + pageSize);
    
    console.log(`Manual filtering result: ${filteredProperties.length} matching properties, showing page ${pageIndex + 1} of ${totalPages}`);
    
    return {
      content: paginatedProperties,
      totalElements,
      totalPages,
      size: pageSize,
      number: pageIndex
    };
  }

  getPropertyById(id: number): Observable<Property> {
    console.log(`Fetching property details for ID: ${id} (type: ${typeof id})`);
    
    // Guard against invalid IDs
    if (!id || isNaN(Number(id))) {
      console.error('Invalid property ID:', id);
      return throwError(() => new Error('Invalid property ID'));
    }
    
    const endpoint = `${this.apiUrl}/get/${id}`;
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    // First attempt to fetch directly using the ID
    return this.http.get<any>(endpoint, { headers }).pipe(
      tap(response => console.log('Direct property lookup response:', this.truncateForLogging(response))),
      map(response => {
        // Better handling of different API response formats
        if (response && response.success === true) {
          // Direct data property in the response (new format)
          if (response.data) {
            const property = this.mapBackendToFrontend(response.data);
            console.log('Property from direct data:', this.truncateForLogging(property));
            console.log('Owner/agent info:', {
              ownerId: property.ownerId,
              ownerName: property.ownerName,
              contactEmail: property.contactEmail,
              contactPhone: property.contactPhone
            });
            return property;
          }
          // New API format where data is in listings array
          else if (response.listings && response.listings.length > 0) {
            const property = this.mapBackendToFrontend(response.listings[0]);
            console.log('Property from listings array:', this.truncateForLogging(property));
            console.log('Owner/agent info:', {
              ownerId: property.ownerId,
              ownerName: property.ownerName,
              contactEmail: property.contactEmail,
              contactPhone: property.contactPhone
            });
            return property;
          }
        }
        
        throw new Error('Property not found');
      }),
      catchError(error => {
        console.log('Error fetching property directly, trying user listings fallback:', error);
        
        // Try user listings as first fallback
        return this.getUserListings().pipe(
          tap(response => console.log('User listings response for property lookup:', response)),
          map(response => {
            // Search through the user's listings for the property
            console.log(`Looking for property ID ${id} in user listings (${response.content.length} listings)`);
            const properties = response.content;
            
            // Try to find the property by ID
            // Need to handle both number and string comparisons in case of type mismatch
            const foundProperty = properties.find(p => 
              p.id === id || p.id === Number(id) || Number(p.id) === id
            );
            
            if (foundProperty) {
              console.log('Found property in user listings:', this.truncateForLogging(foundProperty));
              console.log('Owner/agent info from listings:', {
                ownerId: foundProperty.ownerId,
                ownerName: foundProperty.ownerName,
                contactEmail: foundProperty.contactEmail,
                contactPhone: foundProperty.contactPhone
              });
              return foundProperty;
            }
            
            // If not found in user listings, try general properties as the last resort
            throw new Error('Property not found in user listings');
          }),
          catchError(listingsError => {
            console.log('Property not found in user listings, trying general properties:', listingsError);
            
            // Final fallback: Check all properties from the general properties endpoint
            return this.getProperties({
              refresh: new Date().getTime().toString(),
              status: PropertyStatus.ACTIVE
            }).pipe(
              tap(response => console.log('All properties response for property lookup:', response)),
              map(response => {
                const allProperties = response.content;
                
                // Find the property by ID in all properties
                const foundProperty = allProperties.find(p => 
                  p.id === id || p.id === Number(id) || Number(p.id) === id
                );
                
                if (foundProperty) {
                  console.log('Found property in general properties:', foundProperty);
                  console.log('Owner/agent info from general properties:', {
                    ownerId: foundProperty.ownerId,
                    ownerName: foundProperty.ownerName,
                    contactEmail: foundProperty.contactEmail,
                    contactPhone: foundProperty.contactPhone
                  });
                  return foundProperty;
                }
                
                // If we've reached here, the property truly doesn't exist
                throw new Error('Property not found in any data source');
              }),
              catchError(finalError => {
                console.error('All attempts to find property failed:', finalError);
                throw new Error('Property not found');
              })
            );
          })
        );
      })
    );
  }

  private getNextId(): number {
    const ids = this.dummyProperties
      .map(p => p.id)
      .filter((id): id is number => id !== undefined);
    
    return ids.length > 0 ? Math.max(...ids, 0) + 1 : 1;
  }

  createProperty(property: Partial<Property>): Observable<Property> {
    console.log('Creating property:', property);
    
    if (this.useMockData) {
      // Implementation for mock data...
      console.log('Using mock data for createProperty');
      const newId = this.getNextId();
      const currentUser = this.authService.getCurrentUser();
      
      const newProperty: Property = {
        id: newId,
        title: property.title || 'New Property',
        description: property.description || '',
        price: property.price || 0,
        location: property.location || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0,
        squareFeet: property.squareFeet || 0,
        yearBuilt: property.yearBuilt || new Date().getFullYear(),
        propertyType: property.propertyType || PropertyType.HOUSE,
        listingType: property.listingType || ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        images: property.images || [],
        features: property.features || [],
        ownerId: currentUser?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        featuredImage: property.featuredImage || (property.images && property.images.length > 0 ? property.images[0] : '')
      };
      
      // Add to dummyProperties
      this.dummyProperties.push(newProperty);
      
      // Save to localStorage
      this.saveUserProperties();
      
      console.log('Created mock property:', newProperty);
      return of(newProperty).pipe(delay(500));
    }

    // Use actual API
    console.log('Using API for createProperty');
    
    // Map frontend model to backend model
    const backendProperty = this.mapFrontendToBackend(property as Property);
    console.log('Mapped to backend model:', backendProperty);
    
    // Get auth token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    // Make API call
    return this.http.post(`${this.apiUrl}/create`, backendProperty, { headers })
      .pipe(
        tap(response => {
          console.log('Create property API response:', response);
          this.markPropertiesUpdated();
        }),
        map(response => this.processCreateResponse(response)),
        catchError(error => this.handleCreateError(error))
      );
  }
  
  private processCreateResponse(response: any): Property {
    if (response && response.success && response.listings && response.listings.length > 0) {
      // Map the first listing in the response to our frontend model
      return this.mapBackendToFrontend(response.listings[0]);
    }
    throw new Error('Invalid response format from API');
  }
  
  private handleCreateError(error: any): Observable<never> {
    console.error('Error creating property:', error);
    
    // If API fails and we're using fallback to mock data
    if (true) { // In a real app, you might have a fallback condition
      console.warn('API call failed. Using mock data as fallback.');
      
      // Implementing a mock property creation
      const currentUser = this.authService.getCurrentUser();
      const mockProperty: Property = {
        id: this.getNextId(),
        title: 'Fallback Property (API Failed)',
        description: 'This is a fallback property created because the API call failed.',
        price: 0,
        location: 'Unknown',
        address: 'Unknown',
        city: 'Unknown',
        state: 'Unknown',
        zipCode: 'Unknown',
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        squareFeet: 0,
        yearBuilt: new Date().getFullYear(),
        propertyType: PropertyType.HOUSE,
        listingType: ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        images: [],
        features: [],
        ownerId: currentUser?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        featuredImage: ''
      };
      
      // Add to dummy properties and save
      this.dummyProperties.push(mockProperty);
      this.saveUserProperties();
      
      return of(mockProperty) as unknown as Observable<never>;
    }
    
    return throwError(() => error);
  }

  updateProperty(id: number, property: Partial<Property>): Observable<Property> {
    console.log(`Updating property ${id}:`, property);
    
    if (this.useMockData) {
      // Mock implementation...
      console.log('Using mock data for updateProperty');
      const index = this.dummyProperties.findIndex(p => p.id === id);
      
      if (index !== -1) {
        // Update the property
        this.dummyProperties[index] = {
          ...this.dummyProperties[index],
          ...property,
          updatedAt: new Date()
        };
        
        // Save changes
        this.saveUserProperties();
        
        console.log('Updated mock property:', this.dummyProperties[index]);
        return of(this.dummyProperties[index]).pipe(delay(500));
      }
      
      return throwError(() => new Error(`Property with ID ${id} not found`));
    }
    
    // Use actual API
    console.log('Using API for updateProperty');
    
    // Map frontend model to backend model
    const backendProperty = this.mapFrontendToBackend(property as Property);
    console.log('Mapped to backend model:', backendProperty);
    
    // Get auth token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    // API call to update
    return this.http.put(`${this.apiUrl}/update/${id}`, backendProperty, { headers })
      .pipe(
        tap(response => {
          console.log('Update property API response:', response);
          this.markPropertiesUpdated();
        }),
        map((response: any) => {
          if (response && response.success && response.listings && response.listings.length > 0) {
            // Map the first listing in the response to our frontend model
            return this.mapBackendToFrontend(response.listings[0]);
          }
          throw new Error('Invalid response format from API');
        }),
        catchError(error => {
          console.error('Error updating property:', error);
          return throwError(() => error);
        })
      );
  }

  deleteProperty(id: number): Observable<void> {
    console.log(`Deleting property ${id}`);
    const endpoint = `${this.apiUrl}/delete/${id}`;
    
    // Get auth token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    return this.http.delete<any>(endpoint, { headers }).pipe(
      tap(() => {
        console.log(`Property ${id} deleted successfully`);
        this.markPropertiesUpdated();
      }),
      map(() => {
        return;
      }),
      catchError(error => {
        console.error(`Error deleting property ${id}:`, error);
        throw error;
      })
    );
  }

  updatePropertyStatus(id: number, status: PropertyStatus): Observable<Property> {
    console.log(`Updating property ${id} status to ${status}`);
    
    if (this.useMockData) {
      // Mock implementation
      console.log('Using mock data for updatePropertyStatus');
      const index = this.dummyProperties.findIndex(p => p.id === id);
      
      if (index !== -1) {
        // Update the status
        this.dummyProperties[index].status = status;
        this.dummyProperties[index].updatedAt = new Date();
        
        // Save changes
        this.saveUserProperties();
        
        console.log('Updated mock property status:', this.dummyProperties[index]);
        return of(this.dummyProperties[index]).pipe(delay(500));
      }
      
      return throwError(() => new Error(`Property with ID ${id} not found`));
    }
    
    // Use actual API
    console.log('Using API for updatePropertyStatus');
    
    // Get auth token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
    
    return this.http.put(`${this.apiUrl}/status/${id}?status=${status}`, {}, { headers })
      .pipe(
        tap(response => console.log('Update property status API response:', response)),
        map((response: any) => {
          if (response && response.success && response.listings && response.listings.length > 0) {
            console.log('Successfully updated property status');
            return this.mapBackendToFrontend(response.listings[0]);
          }
          throw new Error('Invalid response format from API');
        }),
        catchError(error => {
          console.error('Error updating property status:', error);
          
          // Fallback to updating local data if API fails
          if (true) { // In a real app, you might have a fallback condition
            console.warn('API call failed. Updating local data as fallback.');
            const localProperty = this.dummyProperties.find(p => p.id === id);
            
            if (localProperty) {
              localProperty.status = status;
              localProperty.updatedAt = new Date();
              this.saveUserProperties();
              return of(localProperty);
            }
          }
          
          return throwError(() => error);
        })
      );
  }

  getFeaturedProperties(limit: number = 4): Observable<Property[]> {
    return this.getProperties({limit: limit, status: PropertyStatus.ACTIVE}).pipe(
      map(response => response.content.slice(0, limit))
    );
  }

  getRecentProperties(limit: number = 8): Observable<Property[]> {
    return this.getProperties({limit: limit, sortBy: 'createdAt', sortOrder: 'desc'}).pipe(
      map(response => response.content.slice(0, limit))
    );
  }

  uploadPropertyImage(propertyId: number, imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Get authentication token
    const token = this.authService.getToken();
    const headers = token ? 
      new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : 
      new HttpHeaders();
      
    return this.http.post<any>(`${this.apiUrl}/${propertyId}/images`, formData, { headers })
      .pipe(
        tap(response => console.log('Image upload response:', response)),
        map(response => {
          if (response && response.imageUrl) {
            return response.imageUrl;
          } else if (response && response.message) {
            throw new Error(response.message);
          } else {
            throw new Error('Unexpected response format');
          }
        }),
        catchError(error => {
          console.error('Error uploading property image:', error);
          
          if (error.status === 401) {
            // Authentication error
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          } else if (error.status === 404) {
            // Property not found
            return throwError(() => new Error(`Property with ID ${propertyId} not found.`));
          } else {
            // Generic error or custom error message from backend
            const errorMessage = error.error?.message || error.message || 'Failed to upload image. Please try again later.';
            return throwError(() => new Error(errorMessage));
          }
        })
      );
  }

  private filterProperty(property: Property, params: PropertySearchParams): boolean {
    // Status check
    if (params.status && property.status !== params.status) {
      return false;
    }
    
    // Owner ID check
    if (params.ownerId && property.ownerId !== params.ownerId) {
      return false;
    }
    
    // City filter
    if (params.city && property.city?.toLowerCase() !== params.city.toLowerCase()) {
      return false;
    }
    
    // State filter
    if (params.state && property.state?.toLowerCase() !== params.state.toLowerCase()) {
      return false;
    }
    
    // Price range filter
    if (params.minPrice !== undefined && property.price < params.minPrice) {
      return false;
    }
    
    if (params.maxPrice !== undefined && property.price > params.maxPrice) {
      return false;
    }
    
    // Property type filter
    if (params.propertyType && property.propertyType !== params.propertyType) {
      return false;
    }
    
    // Location filter (generic search across address, city, state)
    if (params.location) {
      const searchTerm = params.location.toLowerCase();
      const addressMatch = (property.address || '').toLowerCase().includes(searchTerm);
      const cityMatch = (property.city || '').toLowerCase().includes(searchTerm);
      const stateMatch = (property.state || '').toLowerCase().includes(searchTerm);
      
      if (!addressMatch && !cityMatch && !stateMatch) {
        return false;
      }
    }
    
    // Amenities filter
    if (params.amenities && params.amenities.length > 0) {
      const propertyAmenities = property.amenities || [];
      if (!params.amenities.every(amenity => 
        propertyAmenities.some(propAmenity => 
          propAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      )) {
        return false;
      }
    }
    
    return true;
  }

  private filterProperties(properties: Property[], params: PropertySearchParams): Property[] {
    if (!properties || !params) {
      return properties;
    }
    
    let filteredProperties = [...properties];
    
    // Apply filtering based on params
    if (params.minPrice !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.price >= params.minPrice!);
    }
    
    if (params.maxPrice !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.price <= params.maxPrice!);
    }
    
    if (params.propertyType) {
      filteredProperties = filteredProperties.filter(p => p.propertyType === params.propertyType);
    }
    
    if (params.status) {
      filteredProperties = filteredProperties.filter(p => p.status === params.status);
    }
    
    if (params.location) {
      const searchTerm = params.location.toLowerCase();
      filteredProperties = filteredProperties.filter(p => {
        const addressMatch = (p.location || '').toLowerCase().includes(searchTerm);
        const cityMatch = (p.city || '').toLowerCase().includes(searchTerm);
        const stateMatch = (p.state || '').toLowerCase().includes(searchTerm);
        return addressMatch || cityMatch || stateMatch;
      });
    }
    
    if (params.city) {
      const cityTerm = params.city.toLowerCase();
      filteredProperties = filteredProperties.filter(p => 
        (p.city || '').toLowerCase().includes(cityTerm)
      );
    }
    
    if (params.state) {
      const stateTerm = params.state.toLowerCase();
      filteredProperties = filteredProperties.filter(p => 
        (p.state || '').toLowerCase().includes(stateTerm)
      );
    }
    
    if (params.bedrooms !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms >= params.bedrooms!);
    }
    
    if (params.bathrooms !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.bathrooms >= params.bathrooms!);
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProperties = filteredProperties.filter(p => 
        (p.title || '').toLowerCase().includes(searchTerm) ||
        (p.description || '').toLowerCase().includes(searchTerm) ||
        (p.location || '').toLowerCase().includes(searchTerm) ||
        (p.city || '').toLowerCase().includes(searchTerm) ||
        (p.state || '').toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.ownerId !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.ownerId === params.ownerId);
    }
    
    // Apply sorting
    if (params.sortBy || params.sort) {
      const sortBy = (params.sortBy || params.sort || 'createdAt') as keyof Property;
      const sortOrder = params.sortOrder || 'desc';
      
      filteredProperties.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    
    return filteredProperties;
  }

  private mapFrontendPropertyToApi(property: Property): any {
    // REMOVE THIS EMPTY METHOD AS IT'S NO LONGER USED
    return {};
  }

  private mapApiPropertyToFrontend(listing: any): Property {
    // REMOVE THIS EMPTY METHOD AS IT'S NO LONGER USED
    return {} as Property;
  }

  private mapBackendToFrontend(backendProperty: any): Property {
    console.log('Mapping backend property to frontend:', this.truncateForLogging(backendProperty));
    
    let userId = undefined;
    let ownerName = 'Property Owner'; // Default value
    let contactPhone = '';
    let contactEmail = '';
    let amenities: string[] = [];
    let listingTypeValue = ListingType.SALE; // Default value

    // Process listing type from backend
    if (backendProperty.listingType) {
      console.log('Processing listing type from backend:', backendProperty.listingType);
      if (typeof backendProperty.listingType === 'string') {
        const listingTypeUpper = backendProperty.listingType.trim().toUpperCase();
        console.log('Normalized listing type:', listingTypeUpper);
        
        if (listingTypeUpper === 'RENT') {
          listingTypeValue = ListingType.RENT;
        } else if (listingTypeUpper === 'SALE') {
          listingTypeValue = ListingType.SALE;
        } else {
          console.warn('Unknown listing type value:', backendProperty.listingType);
        }
      } else {
        console.warn('Listing type is not a string:', typeof backendProperty.listingType);
      }
      console.log('Final listing type value:', listingTypeValue);
    } else {
      // Check for alternative property fields that might indicate listing type
      if (backendProperty.forRent === true || 
          backendProperty.isRental === true || 
          backendProperty.rentalProperty === true) {
        listingTypeValue = ListingType.RENT;
        console.log('Detected RENT listing from alternative fields');
      }
    }

    // Extract owner information - check multiple possible sources
    // First check for direct transient owner fields in the Listing model
    if (backendProperty.ownerId) {
      userId = backendProperty.ownerId;
      console.log('Found owner ID directly:', userId);
    }
    
    if (backendProperty.ownerName) {
      ownerName = backendProperty.ownerName;
      console.log('Found owner name directly:', ownerName);
    }
    
    if (backendProperty.contactEmail) {
      contactEmail = backendProperty.contactEmail;
      console.log('Found contact email directly:', contactEmail);
    }
    
    if (backendProperty.contactPhone) {
      contactPhone = backendProperty.contactPhone;
      console.log('Found contact phone directly:', contactPhone);
    }

    // Then check if there's a nested user object
    if (backendProperty.user) {
      console.log('Found nested user object:', backendProperty.user);
      
      if (!userId && backendProperty.user.id) {
        userId = backendProperty.user.id;
      }
      
      // Only override owner name if we didn't already get it directly and can construct it from user
      if (ownerName === 'Property Owner') {
        const firstName = backendProperty.user.firstName || '';
        const lastName = backendProperty.user.lastName || '';
        const username = backendProperty.user.username || '';
        
        if (firstName || lastName) {
          ownerName = `${firstName} ${lastName}`.trim();
        } else if (username) {
          ownerName = username;
        }
      }
      
      // Only override contact info if we didn't already get it directly
      if (!contactEmail && backendProperty.user.email) {
        contactEmail = backendProperty.user.email;
      }
      
      if (!contactPhone && backendProperty.user.phone) {
        contactPhone = backendProperty.user.phone;
      }
      
      console.log('Extracted user info:', { userId, ownerName, contactPhone, contactEmail });
    } else if (backendProperty.userId && !userId) {
      // For backward compatibility with older API responses
      userId = typeof backendProperty.userId === 'string' && !isNaN(parseInt(backendProperty.userId)) 
        ? parseInt(backendProperty.userId) 
        : backendProperty.userId;
      console.log('Found userId from legacy field:', userId);
    }

    // Process amenities - handle comma-separated string
    if (backendProperty.amenities && typeof backendProperty.amenities === 'string') {
      amenities = backendProperty.amenities.split(',').map((item: string) => item.trim()).filter(Boolean);
    }

    // Ensure we have a numeric ID by converting string IDs if needed
    let propertyId: number | undefined = undefined;
    if (backendProperty.id !== undefined && backendProperty.id !== null) {
      if (typeof backendProperty.id === 'string') {
        const parsedId = parseInt(backendProperty.id);
        propertyId = !isNaN(parsedId) ? parsedId : undefined;
      } else if (typeof backendProperty.id === 'number') {
        propertyId = backendProperty.id;
      }
    }
    
    // Process property type from backend
    let propertyTypeValue = PropertyType.HOUSE; // Default fallback
    if (backendProperty.propertyType) {
      console.log('Processing property type from backend:', backendProperty.propertyType);
      if (typeof backendProperty.propertyType === 'string') {
        const propertyTypeUpper = backendProperty.propertyType.trim().toUpperCase();
        // Check if the value matches any of our enum values
        if (Object.values(PropertyType).includes(propertyTypeUpper as PropertyType)) {
          propertyTypeValue = propertyTypeUpper as PropertyType;
        } else {
          console.warn('Unknown property type value:', backendProperty.propertyType);
        }
      } else {
        console.warn('Property type is not a string:', typeof backendProperty.propertyType);
      }
      console.log('Final property type value:', propertyTypeValue);
    }

    // Log the ID transformation for debugging
    console.log(`ID transformation: ${backendProperty.id} (${typeof backendProperty.id}) => ${propertyId} (${typeof propertyId})`);
    console.log(`Using listing type: ${listingTypeValue}`);
    console.log(`Using property type: ${propertyTypeValue}`);
    console.log('Owner/Agent info summary:', { userId, ownerName, contactEmail, contactPhone });
    
    const mappedProperty = {
      id: propertyId,
      title: backendProperty.name || backendProperty.title || '',
      description: backendProperty.description || '',
      address: backendProperty.address || '',
      price: backendProperty.price || 0,
      bathrooms: backendProperty.bathrooms || 0,
      bedrooms: backendProperty.bedrooms || 0,
      furnished: backendProperty.furnished || false,
      parking: backendProperty.parking || false,
      images: backendProperty.imageUrls || backendProperty.images || [],
      featuredImage: (backendProperty.imageUrls && backendProperty.imageUrls[0]) || 
                     (backendProperty.images && backendProperty.images[0]) || '',
      ownerId: userId,
      ownerName: ownerName,
      contactPhone: contactPhone,
      contactEmail: contactEmail,
      amenities: amenities,
      status: backendProperty.status || PropertyStatus.ACTIVE,
      propertyType: propertyTypeValue,
      listingType: listingTypeValue,
      createdAt: new Date(backendProperty.createdAt || new Date()),
      updatedAt: new Date(backendProperty.updatedAt || new Date()),
      squareFeet: backendProperty.squareFeet || backendProperty.area || 0
    };
    
    return mappedProperty;
  }

  private mapFrontendToBackend(frontendProperty: Property): any {
    let amenitiesString = '';
    if (frontendProperty.amenities && Array.isArray(frontendProperty.amenities)) {
      amenitiesString = frontendProperty.amenities.join(',');
    }
    
    return {
      name: frontendProperty.title,
      description: frontendProperty.description,
      address: frontendProperty.address,
      price: frontendProperty.price,
      bathrooms: frontendProperty.bathrooms,
      bedrooms: frontendProperty.bedrooms,
      furnished: frontendProperty.furnished,
      parking: frontendProperty.parking,
      imageUrls: frontendProperty.images,
      status: frontendProperty.status,
      amenities: amenitiesString,
      listingType: frontendProperty.listingType
    };
  }

  getUserListings(params: PropertySearchParams = {}): Observable<PropertyResponse> {
    const endpoint = `${this.apiUrl}/user`;
    
    // Create HttpParams object for query parameters
    let httpParams = new HttpParams();
    
    // Add pagination parameters if they exist
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    
    // Add refresh parameter for cache busting
    if (params.refresh !== undefined) {
      httpParams = httpParams.set('_', params.refresh);
    } else if (this.lastPropertyUpdateTime > 0) {
      // If no refresh parameter but properties have been updated, use lastPropertyUpdateTime
      httpParams = httpParams.set('_', this.lastPropertyUpdateTime.toString());
    }
    
    // Get auth token - this is required for this endpoint
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No authentication token available for getUserListings');
      return of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: params.limit || 10,
        number: params.page || 0
      });
    }
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    console.log('Fetching user listings with token and params:', params);
    
    return this.http.get<any>(endpoint, { 
      params: httpParams,
      headers
    }).pipe(
      map(response => {
        console.log('User listings response:', response);
        if (response && response.success && response.data) {
          const properties = response.data.map((listing: any) => this.mapBackendToFrontend(listing));
          
          // Create paginated response
          return {
            content: properties,
            totalElements: properties.length,
            totalPages: Math.ceil(properties.length / (params.limit || 10)),
            size: params.limit || 10,
            number: params.page || 0
          };
        }
        
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: params.limit || 10,
          number: params.page || 0
        };
      }),
      catchError(error => {
        console.error('Error fetching user listings:', error);
        return of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: params.limit || 10,
          number: params.page || 0
        });
      })
    );
  }

  // Add a method to standardize property objects across the application
  public standardizeProperty(property: any): Property {
    if (!property) return {} as Property;
    
    // Create a new standardized property object
    const standardized: Property = {
      ...property,
      // Ensure these fields exist with default values if missing
      images: Array.isArray(property.images) ? [...property.images] : [],
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      price: property.price || 0,
      squareFeet: property.squareFeet || property.area || 0,
      title: property.title || property.propertyName || property.name || 'Property #' + (property.id || 'New'),
      description: property.description || '',
      address: property.address || property.location || '',
      propertyType: property.propertyType || 'OTHER',
      listingType: property.listingType || 'SALE'
    };
    
    // Process image fields for consistency
    // Add propertyImageUrl to images array if it exists and isn't already included
    if (property.propertyImageUrl && 
        !standardized.images.includes(property.propertyImageUrl)) {
      standardized.images.push(property.propertyImageUrl);
    }
    
    // Set featuredImage if it doesn't exist
    if (!standardized.featuredImage) {
      if (standardized.images && standardized.images.length > 0) {
        standardized.featuredImage = standardized.images[0];
      } else if (property.propertyImageUrl) {
        standardized.featuredImage = property.propertyImageUrl;
      }
    }
    
    // Ensure there's always at least a default image path in images array
    if (!standardized.images || standardized.images.length === 0) {
      standardized.images = ['assets/images/prpty.jpg'];
    }
    
    return standardized;
  }
  
  // Add a method to standardize an array of properties
  public standardizeProperties(properties: any[]): Property[] {
    if (!Array.isArray(properties)) return [];
    
    return properties.map(property => this.standardizeProperty(property));
  }
}