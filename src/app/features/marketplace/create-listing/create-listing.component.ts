import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListingsService } from '../../../core/services/listings.service';
import { MarketService } from '../../../core/services/market.service';
import { TornItem } from '../../../core/models/listing.model';

@Component({
  selector: 'app-create-listing',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.css'
})
export class CreateListingComponent implements OnInit {
  createForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isLoadingItems: boolean = false;

  tornItems: { [key: number]: TornItem } | null = null;
  filteredItems: TornItem[] = [];
  searchQuery: string = '';
  selectedItem: TornItem | null = null;

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService,
    private marketService: MarketService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      tornItemId: [0, [Validators.required, Validators.min(1)]],
      itemName: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      pricePerUnit: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTornItems();
  }

  loadTornItems(): void {
    this.isLoadingItems = true;
    this.marketService.getTornItems().subscribe({
      next: (response) => {
        this.tornItems = response.items;
        this.isLoadingItems = false;
      },
      error: (error) => {
        this.isLoadingItems = false;
        this.errorMessage = 'Failed to load Torn items';
      }
    });
  }

  onSearchItems(): void {
    if (!this.tornItems || !this.searchQuery) {
      this.filteredItems = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredItems = Object.values(this.tornItems)
      .filter(item => item.name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 results
  }

  selectItem(item: TornItem): void {
    this.selectedItem = item;
    this.searchQuery = item.name;
    this.filteredItems = [];

    this.createForm.patchValue({
      tornItemId: item.id,
      itemName: item.name,
      pricePerUnit: item.market_value || 0
    });
  }

  calculateTotal(): number {
    const quantity = this.createForm.get('quantity')?.value || 0;
    const pricePerUnit = this.createForm.get('pricePerUnit')?.value || 0;
    return quantity * pricePerUnit;
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.listingsService.createListing(this.createForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Listing created successfully!';

        setTimeout(() => {
          this.router.navigate(['/marketplace/my-listings']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create listing';
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price);
  }
}
