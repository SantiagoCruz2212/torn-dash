import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private readonly CONSENT_KEY = 'torn_dash_cookie_consent';
  private consentGiven$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkConsent();
    }
  }

  /**
   * Verifica si el usuario ya dio su consentimiento
   */
  private checkConsent(): void {
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      this.consentGiven$.next(consent === 'true');
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      this.consentGiven$.next(false);
    }
  }

  /**
   * Guarda el consentimiento del usuario
   */
  giveConsent(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(this.CONSENT_KEY, 'true');
      localStorage.setItem('torn_dash_consent_date', new Date().toISOString());
      this.consentGiven$.next(true);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      alert('No se pudo guardar el consentimiento. Por favor, verifica que las cookies estén habilitadas en tu navegador.');
    }
  }

  /**
   * Revoca el consentimiento del usuario
   */
  revokeConsent(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.removeItem(this.CONSENT_KEY);
      localStorage.removeItem('torn_dash_consent_date');
      // Limpiar otros datos del localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('torn_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      this.consentGiven$.next(false);
    } catch (error) {
      console.error('Error revoking cookie consent:', error);
    }
  }

  /**
   * Retorna un observable que indica si el usuario dio su consentimiento
   */
  get hasConsent$(): Observable<boolean> {
    return this.consentGiven$.asObservable();
  }

  /**
   * Retorna el estado actual del consentimiento
   */
  get hasConsent(): boolean {
    return this.consentGiven$.value;
  }

  /**
   * Verifica si localStorage está disponible
   */
  isLocalStorageAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}
