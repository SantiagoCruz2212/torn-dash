import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AdProvider = 'adsense' | 'adsterra' | 'propellerads';

export interface AdConfig {
  provider: AdProvider;
  client?: string; // For AdSense
  slot?: string; // For AdSense
  format?: string; // For AdSense
  scriptId?: string; // For Adsterra/PropellerAds
  atOptions?: any; // For Adsterra/PropellerAds
}

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private renderer: Renderer2;
  private loadedScripts = new Set<string>();

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Initialize Google AdSense
   */
  initializeAdSense(client: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scriptId = 'google-adsense-script';
    if (this.loadedScripts.has(scriptId)) return;

    const script = this.renderer.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    this.renderer.appendChild(document.head, script);
    this.loadedScripts.add(scriptId);
  }

  /**
   * Initialize Adsterra
   */
  initializeAdsterra(scriptId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = `adsterra-${scriptId}`;
    if (this.loadedScripts.has(id)) return;

    const script = this.renderer.createElement('script');
    script.async = true;
    script.src = `//pl${scriptId}.profitablegatecpm.com/${scriptId}/invoke.js`;
    this.renderer.appendChild(document.head, script);
    this.loadedScripts.add(id);
  }

  /**
   * Initialize PropellerAds
   */
  initializePropellerAds(scriptId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = `propellerads-${scriptId}`;
    if (this.loadedScripts.has(id)) return;

    const script = this.renderer.createElement('script');
    script.async = true;
    script.src = `//thubanoa.com/${scriptId}/invoke.js`;
    this.renderer.appendChild(document.head, script);
    this.loadedScripts.add(id);
  }

  /**
   * Push AdSense ad
   */
  pushAdSense(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }

  /**
   * Load Adsterra ad with options
   */
  loadAdsterra(atOptions: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      (window as any).atOptions = atOptions;
    } catch (e) {
      console.error('Adsterra error:', e);
    }
  }

  /**
   * Load PropellerAds ad with options
   */
  loadPropellerAds(options: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      (window as any).propellerads = options;
    } catch (e) {
      console.error('PropellerAds error:', e);
    }
  }
}
