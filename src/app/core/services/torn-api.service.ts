import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiKeyService } from './api-key.service';

export interface TornBars {
  energy: { current: number; maximum: number; increment: number; interval: number; ticktime: number; fulltime: number };
  nerve: { current: number; maximum: number; increment: number; interval: number; ticktime: number; fulltime: number };
  happy: { current: number; maximum: number; increment: number; interval: number; ticktime: number; fulltime: number };
  life: { current: number; maximum: number; increment: number; interval: number; ticktime: number; fulltime: number };
  chain: { current: number; maximum: number; timeout: number };
  server_time: number;
}

export interface TornTravel {
  destination: string;
  method: string | null;
  timestamp: number;
  departed: number | null;
  time_left: number;
}

export interface TornStock {
  stock_id: number;
  name: string;
  acronym: string;
  current_price: number;
  market_cap: number;
  total_shares: number;
  investors: number;
  benefit: {
    type: string;
    frequency: number;
    requirement: number;
    description: string;
  };
}

export interface TornNetworth {
  total: number;
  wallet: number;
  bank: number;
  points: number;
  items: number;
}

export interface FactionMember {
  name: string;
  level: number;
  days_in_faction: number;
  last_action: {
    status: string;
    timestamp: number;
    relative: string;
  };
  status: {
    state: string;
    description: string;
  };
  position: string;
}

export interface FactionData {
  ID: number;
  name: string;
  tag: string;
  respect: number;
  age: number;
  capacity: number;
  best_chain: number;
  rank: {
    name: string;
    level: number;
  };
  members: { [key: string]: FactionMember };
}

@Injectable({
  providedIn: 'root'
})
export class TornApiService {
  private readonly TORN_API_BASE = 'https://api.torn.com';

  private barsSubject = new BehaviorSubject<TornBars | null>(null);
  private travelSubject = new BehaviorSubject<TornTravel | null>(null);
  private stocksSubject = new BehaviorSubject<{ [key: string]: TornStock } | null>(null);
  private networthSubject = new BehaviorSubject<TornNetworth | null>(null);
  private factionSubject = new BehaviorSubject<FactionData | null>(null);

  private updateInterval: any;
  private readonly UPDATE_INTERVAL_MS = 60000; // Actualizar cada 60 segundos

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiKeyService: ApiKeyService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoUpdate();
    }
  }

  /**
   * Inicia la actualización automática de datos
   */
  private startAutoUpdate(): void {
    // Actualización inicial
    this.updateAllData();

    // Actualización periódica
    this.updateInterval = setInterval(() => {
      this.updateAllData();
    }, this.UPDATE_INTERVAL_MS);
  }

  /**
   * Actualiza todos los datos
   */
  async updateAllData(): Promise<void> {
    const apiKey = this.apiKeyService.getStoredApiKey();
    if (!apiKey) return;

    try {
      await Promise.all([
        this.updateBars(apiKey),
        this.updateTravel(apiKey),
        this.updateStocks(apiKey),
        this.updateNetworth(apiKey),
        this.updateFaction(apiKey)
      ]);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }

  /**
   * Actualiza las barras (energy, nerve, happy, life)
   */
  private async updateBars(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.TORN_API_BASE}/user/?selections=bars&key=${apiKey}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.error) {
        this.barsSubject.next(data as TornBars);
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  }

  /**
   * Actualiza información de viajes
   */
  private async updateTravel(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.TORN_API_BASE}/user/?selections=travel&key=${apiKey}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.error) {
        this.travelSubject.next(data.travel);
      }
    } catch (error) {
      console.error('Error fetching travel:', error);
    }
  }

  /**
   * Actualiza información de stocks
   */
  private async updateStocks(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.TORN_API_BASE}/torn/?selections=stocks&key=${apiKey}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.error) {
        this.stocksSubject.next(data.stocks);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  }

  /**
   * Actualiza networth
   */
  private async updateNetworth(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.TORN_API_BASE}/user/?selections=networth&key=${apiKey}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.error) {
        this.networthSubject.next(data.networth);
      }
    } catch (error) {
      console.error('Error fetching networth:', error);
    }
  }

  /**
   * Actualiza información de facción
   */
  private async updateFaction(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.TORN_API_BASE}/faction/?selections=basic&key=${apiKey}`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.error) {
        this.factionSubject.next(data);
      }
    } catch (error) {
      console.error('Error fetching faction:', error);
    }
  }

  /**
   * Detiene la actualización automática
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Reinicia la actualización automática
   */
  restartAutoUpdate(): void {
    this.stopAutoUpdate();
    this.startAutoUpdate();
  }

  // Getters para los observables
  get bars$(): Observable<TornBars | null> {
    return this.barsSubject.asObservable();
  }

  get bars(): TornBars | null {
    return this.barsSubject.value;
  }

  get travel$(): Observable<TornTravel | null> {
    return this.travelSubject.asObservable();
  }

  get travel(): TornTravel | null {
    return this.travelSubject.value;
  }

  get stocks$(): Observable<{ [key: string]: TornStock } | null> {
    return this.stocksSubject.asObservable();
  }

  get stocks(): { [key: string]: TornStock } | null {
    return this.stocksSubject.value;
  }

  get networth$(): Observable<TornNetworth | null> {
    return this.networthSubject.asObservable();
  }

  get networth(): TornNetworth | null {
    return this.networthSubject.value;
  }

  get faction$(): Observable<FactionData | null> {
    return this.factionSubject.asObservable();
  }

  get faction(): FactionData | null {
    return this.factionSubject.value;
  }

  /**
   * Formatea un número a notación compacta (1.2M, 3.5B, etc)
   */
  static formatCompactNumber(value: number): string {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return value.toFixed(0);
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }

  /**
   * Convierte segundos a formato legible (1h 30m)
   */
  static formatTime(seconds: number): string {
    if (seconds <= 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 && hours === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  ngOnDestroy(): void {
    this.stopAutoUpdate();
  }
}
