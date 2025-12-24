import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TornUserData {
  player_id: number;
  name: string;
  level: number;
  status: {
    description: string;
    state: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private readonly API_KEY_STORAGE = 'torn_api_key';
  private readonly USER_DATA_STORAGE = 'torn_user_data';
  private readonly TORN_API_BASE = 'https://api.torn.com';

  private apiKeyValid$ = new BehaviorSubject<boolean>(false);
  private userData$ = new BehaviorSubject<TornUserData | null>(null);
  private isValidating = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStoredData();
    }
  }

  /**
   * Carga los datos guardados del localStorage
   */
  private loadStoredData(): void {
    try {
      const apiKey = localStorage.getItem(this.API_KEY_STORAGE);
      const userData = localStorage.getItem(this.USER_DATA_STORAGE);

      if (apiKey && userData) {
        this.userData$.next(JSON.parse(userData));
        this.apiKeyValid$.next(true);
      }
    } catch (error) {
      console.error('Error loading stored API data:', error);
    }
  }

  /**
   * Valida la API Key contra la API de Torn City
   */
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; data?: TornUserData }> {
    if (this.isValidating) {
      return { valid: false, error: 'Ya se está validando una API Key' };
    }

    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'La API Key no puede estar vacía' };
    }

    this.isValidating = true;

    try {
      // Hacer petición a la API de Torn City
      const response = await fetch(`${this.TORN_API_BASE}/user/?selections=basic&key=${apiKey}`);

      if (!response.ok) {
        if (response.status === 403) {
          return { valid: false, error: 'API Key inválida o sin permisos' };
        }
        return { valid: false, error: `Error del servidor: ${response.status}` };
      }

      const data = await response.json();

      // Verificar si hay error en la respuesta
      if (data.error) {
        return { valid: false, error: data.error.error || 'Error desconocido' };
      }

      // Extraer datos del usuario
      const userData: TornUserData = {
        player_id: data.player_id,
        name: data.name,
        level: data.level,
        status: data.status
      };

      // Guardar en localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.API_KEY_STORAGE, apiKey);
        localStorage.setItem(this.USER_DATA_STORAGE, JSON.stringify(userData));
      }

      this.userData$.next(userData);
      this.apiKeyValid$.next(true);

      return { valid: true, data: userData };
    } catch (error) {
      console.error('Error validating API key:', error);
      return {
        valid: false,
        error: 'Error de conexión. Verifica tu internet y que la API de Torn esté disponible.'
      };
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Elimina la API Key guardada
   */
  clearApiKey(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.removeItem(this.API_KEY_STORAGE);
      localStorage.removeItem(this.USER_DATA_STORAGE);
      this.apiKeyValid$.next(false);
      this.userData$.next(null);
    } catch (error) {
      console.error('Error clearing API key:', error);
    }
  }

  /**
   * Retorna un observable que indica si la API Key es válida
   */
  get isApiKeyValid$(): Observable<boolean> {
    return this.apiKeyValid$.asObservable();
  }

  /**
   * Retorna el estado actual de validez de la API Key
   */
  get isApiKeyValid(): boolean {
    return this.apiKeyValid$.value;
  }

  /**
   * Retorna un observable con los datos del usuario
   */
  get userData$Observable(): Observable<TornUserData | null> {
    return this.userData$.asObservable();
  }

  /**
   * Retorna los datos del usuario actual
   */
  get userData(): TornUserData | null {
    return this.userData$.value;
  }

  /**
   * Obtiene la API Key guardada
   */
  getStoredApiKey(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.API_KEY_STORAGE);
  }
}
