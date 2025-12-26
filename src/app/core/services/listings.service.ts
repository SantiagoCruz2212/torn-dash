import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BackendApiService } from './backend-api.service';
import {
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingStatus
} from '../models/listing.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private activeListingsSubject = new BehaviorSubject<Listing[]>([]);
  private myListingsSubject = new BehaviorSubject<Listing[]>([]);

  public activeListings$ = this.activeListingsSubject.asObservable();
  public myListings$ = this.myListingsSubject.asObservable();

  constructor(private backendApi: BackendApiService) {}

  get activeListingsValue(): Listing[] {
    return this.activeListingsSubject.value;
  }

  get myListingsValue(): Listing[] {
    return this.myListingsSubject.value;
  }

  getListings(filters?: {
    tornItemId?: number;
    sellerId?: string;
    status?: ListingStatus;
  }): Observable<{ listings: Listing[] }> {
    let params = new HttpParams();

    if (filters?.tornItemId) {
      params = params.set('tornItemId', filters.tornItemId.toString());
    }
    if (filters?.sellerId) {
      params = params.set('sellerId', filters.sellerId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.backendApi.get<{ listings: Listing[] }>('/listings', params).pipe(
      tap(response => {
        this.activeListingsSubject.next(response.listings);
      })
    );
  }

  getMyListings(): Observable<{ listings: Listing[] }> {
    return this.backendApi.get<{ listings: Listing[] }>('/listings/my-listings').pipe(
      tap(response => {
        this.myListingsSubject.next(response.listings);
      })
    );
  }

  getListing(id: string): Observable<{ listing: Listing }> {
    return this.backendApi.get<{ listing: Listing }>(`/listings/${id}`);
  }

  createListing(data: CreateListingRequest): Observable<{ listing: Listing }> {
    return this.backendApi.post<{ listing: Listing }>('/listings', data).pipe(
      tap(response => {
        // Add to my listings
        const currentListings = this.myListingsSubject.value;
        this.myListingsSubject.next([response.listing, ...currentListings]);
      })
    );
  }

  updateListing(id: string, data: UpdateListingRequest): Observable<{ listing: Listing }> {
    return this.backendApi.patch<{ listing: Listing }>(`/listings/${id}`, data).pipe(
      tap(response => {
        // Update in my listings
        const currentListings = this.myListingsSubject.value;
        const index = currentListings.findIndex(l => l.id === id);
        if (index !== -1) {
          currentListings[index] = response.listing;
          this.myListingsSubject.next([...currentListings]);
        }
      })
    );
  }

  deleteListing(id: string): Observable<void> {
    return this.backendApi.delete<void>(`/listings/${id}`).pipe(
      tap(() => {
        // Remove from my listings
        const currentListings = this.myListingsSubject.value;
        this.myListingsSubject.next(currentListings.filter(l => l.id !== id));
      })
    );
  }

  cancelListing(id: string): Observable<{ listing: Listing }> {
    return this.backendApi.post<{ listing: Listing }>(`/listings/${id}/cancel`, {}).pipe(
      tap(response => {
        // Update in my listings
        const currentListings = this.myListingsSubject.value;
        const index = currentListings.findIndex(l => l.id === id);
        if (index !== -1) {
          currentListings[index] = response.listing;
          this.myListingsSubject.next([...currentListings]);
        }
      })
    );
  }
}
