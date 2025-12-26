import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TargetService, TargetResult } from './services/target.service';
import { ApiKeyService } from '../../core/services/api-key.service';

export interface SearchFilters {
  minLevel: number;
  maxLevel: number;
  ignoreInactive: boolean;
  excludeFaction: boolean;
  lowDefensePriority: boolean;
  hospitalizedOnly: boolean;
}

@Component({
  selector: 'app-get-target',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './get-target.component.html',
  styleUrl: './get-target.component.css'
})
export class GetTargetComponent {
  targets: TargetResult[] = [];
  currentIndex = 0;
  loading = false;
  error = '';
  showLoadingToast = false;
  loadingCountdown = 5;
  retryCount = 0;
  maxRetries = 3;
  showNoTargetsToast = false;

  filters: SearchFilters = {
    minLevel: 1,
    maxLevel: 100,
    ignoreInactive: false,
    excludeFaction: false,
    lowDefensePriority: false,
    hospitalizedOnly: false
  };

  recentScans: Array<{name: string, level: number, status: string}> = [];

  constructor(
    private targetService: TargetService,
    private apiKeyService: ApiKeyService
  ) {}

  get hasApiKey(): boolean {
    return this.apiKeyService.isApiKeyValid;
  }

  get currentTarget(): TargetResult | null {
    return this.targets.length > 0 ? this.targets[this.currentIndex] : null;
  }

  get hasTargets(): boolean {
    return this.targets.length > 0;
  }

  scanForTargets(): void {
    const apiKey = this.apiKeyService.getStoredApiKey();

    if (!apiKey) {
      this.error = 'Please configure your API Key first';
      return;
    }

    // Validar filtros
    if (this.filters.minLevel > this.filters.maxLevel) {
      this.error = 'Minimum level cannot be greater than maximum level';
      return;
    }

    if (this.filters.minLevel < 1 || this.filters.maxLevel > 100) {
      this.error = 'Level must be between 1 and 100';
      return;
    }

    this.loading = true;
    this.error = '';
    this.targets = [];
    this.currentIndex = 0;

    this.targetService.getAvailableTargets(apiKey, 10, this.filters).subscribe({
      next: (results) => {
        this.loading = false;

        if (results.length === 0) {
          this.targets = [];
          this.currentIndex = 0;
          this.error = 'No targets match your filters. Try expanding your search criteria.';
        } else {
          // Guardar solo el primer target encontrado
          this.targets = [results[0]];
          this.currentIndex = 0;
          this.error = '';
          // Add to recent scans
          this.addToRecentScans(results[0]);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error fetching targets. Please check your API Key.';
        console.error('Error:', err);
      }
    });
  }

  nextTarget(): void {
    // Resetear contador de reintentos
    this.retryCount = 0;

    // Mostrar toast y resetear contador
    this.showLoadingToast = true;
    this.loadingCountdown = 5;
    this.error = '';

    // Contador regresivo cada segundo
    const interval = setInterval(() => {
      this.loadingCountdown--;

      if (this.loadingCountdown === 0) {
        clearInterval(interval);
        this.showLoadingToast = false;
        this.loading = true;

        // Pequeño delay antes de buscar para mostrar el último frame del toast
        setTimeout(() => {
          this.scanForTargetsWithRetry();
        }, 100);
      }
    }, 1000);
  }

  scanForTargetsWithRetry(): void {
    const apiKey = this.apiKeyService.getStoredApiKey();

    if (!apiKey) {
      this.error = 'Please configure your API Key first';
      this.loading = false;
      return;
    }

    // Validar filtros
    if (this.filters.minLevel > this.filters.maxLevel) {
      this.error = 'Minimum level cannot be greater than maximum level';
      this.loading = false;
      return;
    }

    if (this.filters.minLevel < 1 || this.filters.maxLevel > 100) {
      this.error = 'Level must be between 1 and 100';
      this.loading = false;
      return;
    }

    console.log(`🔄 Intento ${this.retryCount + 1} de ${this.maxRetries}...`);

    this.targetService.getAvailableTargets(apiKey, 10, this.filters).subscribe({
      next: (results) => {
        if (results.length === 0) {
          // No se encontró ningún target
          this.retryCount++;

          if (this.retryCount < this.maxRetries) {
            // Reintentar automáticamente
            console.log(`⚠️ No se encontraron targets. Reintentando (${this.retryCount}/${this.maxRetries})...`);
            setTimeout(() => {
              this.scanForTargetsWithRetry();
            }, 500); // Pequeño delay antes del reintento
          } else {
            // Máximo de reintentos alcanzado
            console.log(`❌ No se encontraron targets después de ${this.maxRetries} intentos`);
            this.loading = false;
            this.targets = [];
            this.currentIndex = 0;
            this.showNoTargetsToast = true;
          }
        } else {
          // Target encontrado exitosamente
          console.log(`✅ Target encontrado en intento ${this.retryCount + 1}`);
          this.loading = false;
          this.targets = [results[0]];
          this.currentIndex = 0;
          this.error = '';
          this.retryCount = 0;
          this.addToRecentScans(results[0]);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error fetching targets. Please check your API Key.';
        console.error('Error:', err);
      }
    });
  }

  attackTarget(targetId: number): void {
    window.open(`https://www.torn.com/loader.php?sid=attack&user2ID=${targetId}`, '_blank');
  }

  viewProfile(targetId: number): void {
    window.open(`https://www.torn.com/profiles.php?XID=${targetId}`, '_blank');
  }

  clearTargets(): void {
    this.targets = [];
    this.currentIndex = 0;
    this.error = '';
  }

  closeNoTargetsToast(): void {
    this.showNoTargetsToast = false;
    this.retryCount = 0;
  }

  private addToRecentScans(target: TargetResult): void {
    this.recentScans.unshift({
      name: target.name,
      level: target.level,
      status: target.status
    });

    if (this.recentScans.length > 5) {
      this.recentScans.pop();
    }
  }

  getStatPercentage(stat: number): number {
    const maxStat = 3000;
    return Math.min((stat / maxStat) * 100, 100);
  }

  getStatColor(statName: string): string {
    const colors: {[key: string]: string} = {
      'strength': '#0df259',
      'defense': '#facc15',
      'speed': '#3b82f6',
      'dexterity': '#a855f7'
    };
    return colors[statName.toLowerCase()] || '#0df259';
  }
}
