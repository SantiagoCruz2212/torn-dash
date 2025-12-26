import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { Listing, ListingStatus } from '../../../core/models/listing.model';

@Component({
  selector: 'app-my-listings',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.css'
})
export class MyListingsComponent implements OnInit {
  listings: Listing[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ListingStatus = ListingStatus;

  constructor(private listingsService: ListingsService) {}

  ngOnInit(): void {
    this.loadMyListings();
  }

  loadMyListings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingsService.getMyListings().subscribe({
      next: (response) => {
        this.listings = response.listings;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load your listings';
      }
    });
  }

  cancelListing(id: string): void {
    if (!confirm('Are you sure you want to cancel this listing?')) {
      return;
    }

    this.listingsService.cancelListing(id).subscribe({
      next: () => {
        this.loadMyListings();
      },
      error: (error) => {
        alert('Failed to cancel listing: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  deleteListing(id: string): void {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }

    this.listingsService.deleteListing(id).subscribe({
      next: () => {
        this.loadMyListings();
      },
      error: (error) => {
        alert('Failed to delete listing: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('$', '$');
  }

  getStatusClass(status: ListingStatus): string {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'bg-green-900 text-green-300';
      case ListingStatus.SOLD:
        return 'bg-gray-700 text-gray-400';
      case ListingStatus.CANCELLED:
        return 'bg-red-900 text-red-300';
      case ListingStatus.EXPIRED:
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  }
}
