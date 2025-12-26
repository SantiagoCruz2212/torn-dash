import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { Listing, ListingStatus } from '../../../core/models/listing.model';

@Component({
  selector: 'app-browse',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowseComponent implements OnInit {
  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  searchQuery: string = '';
  selectedStatus: ListingStatus | 'ALL' = ListingStatus.ACTIVE;

  ListingStatus = ListingStatus;

  constructor(private listingsService: ListingsService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = this.selectedStatus !== 'ALL' ? { status: this.selectedStatus } : undefined;

    this.listingsService.getListings(filters).subscribe({
      next: (response) => {
        this.listings = response.listings;
        this.filteredListings = response.listings;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load listings';
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.listings];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.itemName.toLowerCase().includes(query) ||
        listing.seller?.username.toLowerCase().includes(query)
      );
    }

    this.filteredListings = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.loadListings();
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
