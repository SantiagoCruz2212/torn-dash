import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction, TransactionStatus } from '../../../core/models/listing.model';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule, RouterLink],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css'
})
export class PurchasesComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  TransactionStatus = TransactionStatus;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getMyPurchases().subscribe({
      next: (response) => {
        this.transactions = response.transactions;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load purchases';
      }
    });
  }

  confirmTransaction(id: string): void {
    if (!confirm('Have you sent the items in Torn City? Confirm only after sending.')) {
      return;
    }

    this.transactionService.confirmTransaction(id).subscribe({
      next: () => {
        this.loadPurchases();
      },
      error: (error) => {
        alert('Failed to confirm transaction: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  cancelTransaction(id: string): void {
    if (!confirm('Are you sure you want to cancel this transaction?')) {
      return;
    }

    this.transactionService.cancelTransaction(id).subscribe({
      next: () => {
        this.loadPurchases();
      },
      error: (error) => {
        alert('Failed to cancel transaction: ' + (error.error?.message || 'Unknown error'));
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

  getStatusClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-900 text-yellow-300';
      case TransactionStatus.COMPLETED:
        return 'bg-green-900 text-green-300';
      case TransactionStatus.CANCELLED:
        return 'bg-red-900 text-red-300';
      case TransactionStatus.DISPUTED:
        return 'bg-orange-900 text-orange-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  }
}
