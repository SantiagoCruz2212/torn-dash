import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { BackendApiService } from './backend-api.service';
import { Transaction, BuyListingRequest, ConfirmTransactionRequest } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private purchasesSubject = new BehaviorSubject<Transaction[]>([]);
  private salesSubject = new BehaviorSubject<Transaction[]>([]);

  purchases$ = this.purchasesSubject.asObservable();
  sales$ = this.salesSubject.asObservable();

  constructor(private backendApi: BackendApiService) {}

  get purchasesValue(): Transaction[] {
    return this.purchasesSubject.value;
  }

  get salesValue(): Transaction[] {
    return this.salesSubject.value;
  }

  buyListing(listingId: string, data: BuyListingRequest): Observable<{ transaction: Transaction }> {
    return this.backendApi.post<{ transaction: Transaction }>(`/listings/${listingId}/buy`, data);
  }

  getMyPurchases(): Observable<{ transactions: Transaction[] }> {
    return this.backendApi.get<{ transactions: Transaction[] }>('/transactions/purchases').pipe(
      tap(response => {
        this.purchasesSubject.next(response.transactions);
      })
    );
  }

  getMySales(): Observable<{ transactions: Transaction[] }> {
    return this.backendApi.get<{ transactions: Transaction[] }>('/transactions/sales').pipe(
      tap(response => {
        this.salesSubject.next(response.transactions);
      })
    );
  }

  getById(transactionId: string): Observable<{ transaction: Transaction }> {
    return this.backendApi.get<{ transaction: Transaction }>(`/transactions/${transactionId}`);
  }

  confirmTransaction(transactionId: string, data?: ConfirmTransactionRequest): Observable<{ transaction: Transaction }> {
    return this.backendApi.patch<{ transaction: Transaction }>(`/transactions/${transactionId}/confirm`, data || {}).pipe(
      tap(response => {
        // Update the transaction in both purchases and sales lists
        const updatedTransaction = response.transaction;

        // Update purchases list
        const purchases = this.purchasesSubject.value;
        const purchaseIndex = purchases.findIndex(t => t.id === transactionId);
        if (purchaseIndex !== -1) {
          purchases[purchaseIndex] = updatedTransaction;
          this.purchasesSubject.next([...purchases]);
        }

        // Update sales list
        const sales = this.salesSubject.value;
        const saleIndex = sales.findIndex(t => t.id === transactionId);
        if (saleIndex !== -1) {
          sales[saleIndex] = updatedTransaction;
          this.salesSubject.next([...sales]);
        }
      })
    );
  }

  cancelTransaction(transactionId: string): Observable<{ transaction: Transaction }> {
    return this.backendApi.patch<{ transaction: Transaction }>(`/transactions/${transactionId}/cancel`, {}).pipe(
      tap(response => {
        // Update the transaction in both purchases and sales lists
        const updatedTransaction = response.transaction;

        // Update purchases list
        const purchases = this.purchasesSubject.value;
        const purchaseIndex = purchases.findIndex(t => t.id === transactionId);
        if (purchaseIndex !== -1) {
          purchases[purchaseIndex] = updatedTransaction;
          this.purchasesSubject.next([...purchases]);
        }

        // Update sales list
        const sales = this.salesSubject.value;
        const saleIndex = sales.findIndex(t => t.id === transactionId);
        if (saleIndex !== -1) {
          sales[saleIndex] = updatedTransaction;
          this.salesSubject.next([...sales]);
        }
      })
    );
  }
}
