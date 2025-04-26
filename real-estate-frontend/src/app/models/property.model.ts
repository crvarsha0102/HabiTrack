import { ListingType } from './listing-type.enum';
import { PropertyStatus } from './property-status.enum';

export { ListingType } from './listing-type.enum';
export { PropertyStatus } from './property-status.enum';

export interface Property {
  id?: number;
  title: string;
  propertyName?: string; // Alternative name from backend
  description: string;
  price: number;
  location?: string;  // For display, will be mapped from address
  address: string;  // From backend
  city?: string;     // From backend
  state?: string;    // From backend
  zipCode?: string;  // From backend
  bedrooms: number;
  bathrooms: number;
  area?: number;      // For display, will be mapped from squareFeet
  squareFeet?: number; // From backend
  yearBuilt?: number;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  amenities?: string[];
  images: string[];
  features?: string[];
  ownerId?: number;
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  featuredImage?: string;
  propertyImageUrl?: string;
  furnished?: boolean;
  parking?: boolean;
  imageUrls?: string[];
  userId?: string;
}

export interface PropertySearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  sort?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: string;
  location?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  ownerId?: number;
  listingType?: string;
  refresh?: string;
  favorites?: boolean;
}

export interface PropertyResponse {
  content: Property[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OTHER = 'OTHER'
} 