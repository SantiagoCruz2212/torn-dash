import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdblockDetectorService implements OnDestroy {
  // 🔧 MODO DESARROLLADOR - Cambia a false en producción
  private readonly modo_dev = true;

  private adBlockDetected$ = new BehaviorSubject<boolean>(false);
  private isChecking = false;
  private checkInterval: any;
  private readonly CHECK_INTERVAL_MS = 3000; // Verificar cada 3 segundos

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId) && !this.modo_dev) {
      this.startContinuousDetection();
    }

    if (this.modo_dev) {
      console.log('🔧 MODO DESARROLLADOR ACTIVO - Detección de AdBlock deshabilitada');
    }
  }

  /**
   * Inicia la detección continua de AdBlock
   */
  private startContinuousDetection(): void {
    // Verificación inicial inmediata
    this.detectAdBlock();

    // Verificaciones periódicas
    this.checkInterval = setInterval(() => {
      this.detectAdBlock();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Detiene la detección continua
   */
  stopDetection(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Reinicia la detección continua
   */
  restartDetection(): void {
    this.stopDetection();
    this.startContinuousDetection();
  }

  /**
   * Detecta si hay un AdBlock activo (optimizado para Adblock Plus)
   */
  private async detectAdBlock(): Promise<void> {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      let detectionScore = 0;
      const methods = [];

      // Método 1: Bait element con múltiples clases de ads
      try {
        const bait = document.createElement('div');
        bait.innerHTML = '&nbsp;';
        bait.className = 'ad adsbox doubleclick ad-placement carbon-ads';
        bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -999px !important; top: -999px !important;';
        document.body.appendChild(bait);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (bait.offsetParent === null || bait.offsetHeight === 0 || bait.clientHeight === 0) {
          detectionScore++;
          methods.push('Bait 1 blocked');
        }

        document.body.removeChild(bait);
      } catch (e) {
        detectionScore++;
        methods.push('Bait 1 error');
      }

      // Método 2: Elemento con ID típico de ads
      try {
        const adBanner = document.createElement('div');
        adBanner.id = 'ad-banner';
        adBanner.className = 'ad-banner';
        adBanner.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -999px; top: -999px;';
        document.body.appendChild(adBanner);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (adBanner.offsetParent === null || adBanner.offsetHeight === 0) {
          detectionScore++;
          methods.push('ID banner blocked');
        }

        document.body.removeChild(adBanner);
      } catch (e) {
        detectionScore++;
        methods.push('ID banner error');
      }

      // Método 3: Verificar con múltiples clases de publicidad
      try {
        const sponsor = document.createElement('div');
        sponsor.innerHTML = 'Ad';
        sponsor.className = 'sponsor-container sponsored-content advertisement';
        sponsor.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -999px; top: -999px;';
        document.body.appendChild(sponsor);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (sponsor.offsetParent === null || sponsor.offsetHeight === 0 || sponsor.clientHeight === 0) {
          detectionScore++;
          methods.push('Sponsor blocked');
        }

        document.body.removeChild(sponsor);
      } catch (e) {
        detectionScore++;
        methods.push('Sponsor error');
      }

      // Método 4: Verificar con clase específica de Google Ads
      try {
        const googleAd = document.createElement('div');
        googleAd.className = 'pub_300x250 pub_300x250m pub_728x90';
        googleAd.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -999px; top: -999px;';
        document.body.appendChild(googleAd);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (googleAd.offsetParent === null || googleAd.offsetHeight === 0) {
          detectionScore++;
          methods.push('Google Ad blocked');
        }

        document.body.removeChild(googleAd);
      } catch (e) {
        detectionScore++;
        methods.push('Google Ad error');
      }

      // Método 5: Intentar fetch a un recurso de ads conocido
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500);

        const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        }).catch(() => null);

        clearTimeout(timeoutId);

        if (!response) {
          detectionScore++;
          methods.push('Fetch blocked');
        }
      } catch (e) {
        detectionScore++;
        methods.push('Fetch error');
      }

      // Si al menos 2 métodos detectan bloqueo, consideramos que hay AdBlock
      const hasAdBlock = detectionScore >= 2;

      this.adBlockDetected$.next(hasAdBlock);

      console.log('🔍 AdBlock Detection:', {
        score: `${detectionScore}/5`,
        methods,
        hasAdBlock: hasAdBlock ? '❌ DETECTED' : '✅ Not detected'
      });
    } catch (error) {
      console.error('❌ Error detecting AdBlock:', error);
      // En caso de error general, no bloqueamos
      this.adBlockDetected$.next(false);
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Retorna un observable que indica si hay AdBlock
   */
  get isAdBlockDetected$(): Observable<boolean> {
    return this.adBlockDetected$.asObservable();
  }

  /**
   * Retorna el estado actual de AdBlock
   */
  get isAdBlockDetected(): boolean {
    return this.adBlockDetected$.value;
  }

  /**
   * Vuelve a verificar si hay AdBlock (fuerza una verificación inmediata)
   */
  async recheckAdBlock(): Promise<void> {
    if (this.modo_dev) {
      console.log('🔧 MODO DEV: Recheck ignorado');
      return;
    }
    console.log('🔄 Manual recheck requested...');
    await this.detectAdBlock();
  }

  /**
   * Limpieza al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopDetection();
  }
}
