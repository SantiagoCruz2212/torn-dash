import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { HeaderComponent } from './layout/components/header/header.component';
import { AdblockWarningComponent } from './shared/components/adblock-warning/adblock-warning.component';
import { AdblockDetectorService } from './core/services/adblock-detector.service';
import { CookieConsentService } from './core/services/cookie-consent.service';
import { ApiKeyService, TornUserData } from './core/services/api-key.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    AdblockWarningComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'torn-dash';

  // Estados de verificación
  showAdBlockWarning = false;
  showCookieConsent = false;
  showApiKeySetup = false;
  isAppReady = false;

  // API Key setup
  apiKey = '';
  isValidatingApiKey = false;
  apiKeyError = '';

  constructor(
    public adblockDetector: AdblockDetectorService,
    public cookieConsent: CookieConsentService,
    public apiKeyService: ApiKeyService
  ) {}

  ngOnInit(): void {
    this.checkAppRequirements();

    // Suscribirse a cambios en AdBlock (verificar siempre que cambie el estado)
    this.adblockDetector.isAdBlockDetected$.subscribe(hasAdBlock => {
      console.log('🔔 AdBlock state changed:', hasAdBlock ? '❌ DETECTED' : '✅ Clear');
      this.checkAppRequirements();
    });
  }

  /**
   * Verifica los requisitos de la aplicación en orden
   */
  private checkAppRequirements(): void {
    // 1. Verificar AdBlock
    if (this.adblockDetector.isAdBlockDetected) {
      this.showAdBlockWarning = true;
      this.showCookieConsent = false;
      this.showApiKeySetup = false;
      this.isAppReady = false;
      return;
    }

    this.showAdBlockWarning = false;

    // 2. Verificar consentimiento de cookies
    if (!this.cookieConsent.hasConsent) {
      this.showCookieConsent = true;
      this.showApiKeySetup = false;
      this.isAppReady = false;
      return;
    }

    this.showCookieConsent = false;

    // 3. Verificar API Key
    if (!this.apiKeyService.isApiKeyValid) {
      this.showApiKeySetup = true;
      this.isAppReady = false;
      return;
    }

    // Todo OK
    this.showApiKeySetup = false;
    this.isAppReady = true;
  }

  /**
   * Maneja la aceptación de cookies
   */
  acceptCookies(): void {
    this.cookieConsent.giveConsent();
    this.checkAppRequirements();
  }

  /**
   * Maneja la validación de API Key
   */
  async validateApiKey(): Promise<void> {
    if (this.isValidatingApiKey) return;

    this.isValidatingApiKey = true;
    this.apiKeyError = '';

    const result = await this.apiKeyService.validateApiKey(this.apiKey);

    if (result.valid) {
      this.checkAppRequirements();
    } else {
      this.apiKeyError = result.error || 'Error al validar la API Key';
    }

    this.isValidatingApiKey = false;
  }

  /**
   * Maneja el logout
   */
  handleLogout(): void {
    this.apiKeyService.clearApiKey();
    window.location.reload();
  }
}

