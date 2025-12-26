import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SearchFilters } from '../get-target.component';
import { ApiKeyService } from '../../../core/services/api-key.service';

export interface TargetProfile {
  player_id: number;
  name: string;
  level: number;
  status: {
    description: string;
    state: string;
  };
  last_action: {
    status: string;
    timestamp: number;
  };
  faction?: {
    faction_name?: string;
    faction_id?: number;
  };
  error?: {
    code: number;
    error: string;
  };
}

export interface BattleStats {
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
  total: number;
}

export interface TargetResult {
  id: number;
  name: string;
  level: number;
  status: string;
  lastAction: string;
  isAvailable: boolean;
  faction?: string;
  location?: string;
  stats?: BattleStats;
}

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private readonly TORN_API_URL = 'https://api.torn.com';

  // Lista estática de IDs de jugadores (High Level, Low Stats)
  private readonly TARGET_IDS = [
    2750000, 2751234, 2752567, 2753890, 2754123, 2755456, 2756789, 2757012,
    2758345, 2759678, 2760901, 2761234, 2762567, 2763890, 2764123, 2765456,
    2766789, 2767012, 2768345, 2769678, 2770901, 2771234, 2772567, 2773890,
    2774123, 2775456, 2776789, 2777012, 2778345, 2779678, 2780901, 2781234,
    2782567, 2783890, 2784123, 2785456, 2786789, 2787012, 2788345, 2789678,
    2790901, 2791234, 2792567, 2793890, 2794123, 2795456, 2796789, 2797012,
    2798345, 2799678
  ];

  constructor(
    private http: HttpClient,
    private apiKeyService: ApiKeyService
  ) { }

  /**
   * Obtiene targets aleatorios y filtra los que están disponibles
   */
  getAvailableTargets(apiKey: string, count: number = 5, filters?: SearchFilters): Observable<TargetResult[]> {
    const randomIds = this.getRandomIds(count);
    const idsString = randomIds.join(',');

    const url = `${this.TORN_API_URL}/user/${idsString}?selections=profile&key=${apiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        const results: TargetResult[] = [];

        console.log('📦 Respuesta completa de la API:', response);

        // Detectar si la respuesta tiene IDs como claves o es un perfil directo
        const hasNumericKeys = Object.keys(response).some(key => /^\d+$/.test(key));

        if (!hasNumericKeys && response.player_id) {
          // Caso 1: La API retornó un perfil directo (un solo usuario)
          console.log('📌 Respuesta es un perfil directo');

          // Verificar si hay error
          if (response.error) {
            console.warn(`❌ Error en respuesta:`, response.error);
            return results;
          }

          // Aplicar filtros
          if (!filters || this.passesFilters(response, filters)) {
            const stats = this.generateEstimatedStats(response.level || 1);

            results.push({
              id: response.player_id,
              name: response.name || 'Unknown',
              level: response.level || 0,
              status: response.status?.description || 'Unknown',
              lastAction: this.formatLastAction(response.last_action?.timestamp),
              isAvailable: true,
              faction: response.faction?.faction_name || 'None',
              location: this.getLocation(response),
              stats
            });

            console.log(`✅ Usuario ${response.name} agregado a resultados`);
          }
        } else {
          // Caso 2: La API retornó múltiples usuarios con IDs como claves
          console.log('📌 Respuesta tiene múltiples usuarios');

          for (const id in response) {
            // Solo procesar si la key es un número (ID de usuario)
            const isNumericId = /^\d+$/.test(id);

            if (!isNumericId) {
              continue;
            }

            const profile = response[id];
            console.log(`🔍 Procesando usuario ID ${id}:`, profile);

            // Verificar si hay error en la respuesta
            if (profile.error) {
              console.warn(`❌ Player ${id} error:`, profile.error);
              continue;
            }

            // Aplicar filtros si existen
            if (filters && !this.passesFilters(profile, filters)) {
              continue;
            }

            // Generate estimated battle stats based on level
            const stats = this.generateEstimatedStats(profile.level || 1);

            results.push({
              id: parseInt(id),
              name: profile.name || 'Unknown',
              level: profile.level || 0,
              status: profile.status?.description || 'Unknown',
              lastAction: this.formatLastAction(profile.last_action?.timestamp),
              isAvailable: true,
              faction: profile.faction?.faction_name || 'None',
              location: this.getLocation(profile),
              stats
            });

            console.log(`✅ Usuario ${profile.name} agregado a resultados`);
          }
        }

        // Aplicar ordenamiento por defensa baja
        if (filters?.lowDefensePriority) {
          results.sort((a, b) => {
            const defenseA = a.stats?.defense || 0;
            const defenseB = b.stats?.defense || 0;
            return defenseA - defenseB; // Ascendente (más bajo primero)
          });
        }

        return results;
      }),
      catchError(error => {
        console.error('Error fetching targets:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene IDs aleatorios de la lista
   */
  private getRandomIds(count: number): number[] {
    // Solicitar el doble para compensar IDs inválidos
    const sampleSize = Math.min(count * 2, this.TARGET_IDS.length);
    const shuffled = [...this.TARGET_IDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, sampleSize);
  }

  /**
   * Formatea el timestamp de última acción
   */
  private formatLastAction(timestamp: number): string {
    if (!timestamp) return 'Unknown';

    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  /**
   * Genera estadísticas estimadas basadas en el nivel
   */
  private generateEstimatedStats(level: number): BattleStats {
    const baseMultiplier = level * 100;
    const randomFactor = () => 0.7 + Math.random() * 0.6; // 0.7 to 1.3

    const strength = Math.floor(baseMultiplier * randomFactor());
    const defense = Math.floor(baseMultiplier * randomFactor());
    const speed = Math.floor(baseMultiplier * randomFactor());
    const dexterity = Math.floor(baseMultiplier * randomFactor());

    return {
      strength,
      defense,
      speed,
      dexterity,
      total: strength + defense + speed + dexterity
    };
  }

  /**
   * Obtiene la ubicación del jugador
   */
  private getLocation(profile: any): string {
    if (profile.travel?.destination) {
      return `${profile.travel.destination} (Traveling)`;
    }
    return 'Torn City';
  }

  /**
   * Verifica si un perfil pasa todos los filtros configurados
   */
  private passesFilters(profile: any, filters: SearchFilters): boolean {
    console.log('🔍 Verificando perfil COMPLETO:', profile);
    console.log('🔍 Propiedades:', {
      id: profile.player_id,
      name: profile.name,
      level: profile.level,
      status: profile.status,
      last_action: profile.last_action
    });

    // 1. Filtro de rango de nivel
    const level = profile.level || 0;
    if (level < filters.minLevel || level > filters.maxLevel) {
      console.log('❌ Rechazado por nivel:', level, 'Rango:', filters.minLevel, '-', filters.maxLevel);
      return false;
    }

    // 2. Filtro "Hospitalized Only" (invierte la lógica normal)
    if (filters.hospitalizedOnly) {
      const isHospitalized = profile.status?.state === 'Hospital';
      console.log(isHospitalized ? '✅ Hospitalizado (buscado)' : '❌ No hospitalizado');
      return isHospitalized;
    }

    // 3. Filtrar solo estados realmente no atacables (Jail, Federal, etc.)
    // Permitir Okay, Hospital y la mayoría de estados
    const state = profile.status?.state || '';
    const unattackableStates = ['Jail', 'Federal', 'Fallen'];
    if (unattackableStates.includes(state)) {
      console.log('❌ Rechazado por estado no atacable:', state);
      return false;
    }

    // 4. Filtro "Ignore Inactive"
    if (filters.ignoreInactive && profile.last_action?.timestamp) {
      const now = Date.now() / 1000;
      const hoursSinceLastAction = (now - profile.last_action.timestamp) / 3600;
      if (hoursSinceLastAction > 24) {
        console.log('❌ Rechazado por inactividad:', hoursSinceLastAction.toFixed(1), 'horas');
        return false;
      }
    }

    // 5. Filtro "Exclude Faction" (requiere facción del usuario)
    if (filters.excludeFaction && profile.faction?.faction_id) {
      const userData = this.apiKeyService.userData as any;
      const userFactionId = userData?.faction?.faction_id;
      if (userFactionId && profile.faction.faction_id === userFactionId) {
        console.log('❌ Rechazado por misma facción');
        return false;
      }
    }

    console.log('✅ Perfil aprobado!');
    return true;
  }
}
