import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Property, PropertyType } from '../../models/property.model';
import { ListingType } from '../../models/listing-type.enum';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.css'],
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent]
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Input() showActions: boolean = true;

  constructor(private router: Router) {}

  get formattedPrice(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(this.property.price);
  }

  get listingBadgeClass(): string {
    return this.property.listingType === ListingType.SALE
      ? 'bg-primary-600 text-white'
      : 'bg-secondary-600 text-white';
  }

  get propertyTypeDisplay(): string {
    if (!this.property || !this.property.propertyType) {
      return 'Unknown';
    }
    return this.property.propertyType.charAt(0) + 
           this.property.propertyType.slice(1).toLowerCase();
  }

  navigateToPropertyDetail(): void {
    this.router.navigate(['/properties', this.property.id]);
  }
} 