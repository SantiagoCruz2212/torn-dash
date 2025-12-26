import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BackendApiService } from './backend-api.service';
import { TornItem } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private tornItemsSubject = new BehaviorSubject<{ [key: number]: TornItem } | null>(null);
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  public tornItems$ = this.tornItemsSubject.asObservable();

  constructor(private backendApi: BackendApiService) {}

  get tornItemsValue(): { [key: number]: TornItem } | null {
    return this.tornItemsSubject.value;
  }

  getTornItems(forceRefresh: boolean = false): Observable<{ items: { [key: number]: TornItem } }> {
    const now = Date.now();
    const cacheExpired = now - this.lastFetchTime > this.CACHE_DURATION;

    if (!forceRefresh && !cacheExpired && this.tornItemsValue) {
      // Return cached data
      return new Observable(observer => {
        observer.next({ items: this.tornItemsValue! });
        observer.complete();
      });
    }

    return this.backendApi.get<{ items: { [key: number]: TornItem } }>('/market/items').pipe(
      tap(response => {
        this.tornItemsSubject.next(response.items);
        this.lastFetchTime = now;
      })
    );
  }

  getTornItem(itemId: number): Observable<{ item: TornItem }> {
    return this.backendApi.get<{ item: TornItem }>(`/market/items/${itemId}`);
  }

  searchItems(query: string): TornItem[] {
    const items = this.tornItemsValue;
    if (!items || !query) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return Object.values(items).filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }
}
