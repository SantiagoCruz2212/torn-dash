import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TornApiService, TornTravel } from '../../core/services/torn-api.service';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';

interface TravelDestination {
  name: string;
  country_code: string;
  flagUrl: string;
  time: string; // Tiempo de viaje en segundos
  timeLabel: string; // Tiempo formateado
  items: string[];
  description: string;
  profitPotential: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

@Component({
  selector: 'app-travel-radar',
  imports: [CommonModule, AdBannerComponent],
  templateUrl: './travel-radar.component.html',
  styleUrl: './travel-radar.component.css'
})
export class TravelRadarComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  currentTravel: TornTravel | null = null;
  isOnline = true;

  destinations: TravelDestination[] = [
    {
      name: 'Mexico',
      country_code: 'mx',
      flagUrl: 'https://flagcdn.com/w80/mx.png',
      time: '26',
      timeLabel: '26 min',
      items: ['Donator Pack', 'Xanax'],
      description: 'Farmacia, items medicinales',
      profitPotential: 'Medio',
      difficulty: 'easy'
    },
    {
      name: 'Cayman Islands',
      country_code: 'ky',
      flagUrl: 'https://flagcdn.com/w80/ky.png',
      time: '35',
      timeLabel: '35 min',
      items: ['Lawyer Business Card'],
      description: 'Servicios legales, abogados',
      profitPotential: 'Alto',
      difficulty: 'easy'
    },
    {
      name: 'Canada',
      country_code: 'ca',
      flagUrl: 'https://flagcdn.com/w80/ca.png',
      time: '41',
      timeLabel: '41 min',
      items: ['Plushie'],
      description: 'Flores, juguetes, items decorativos',
      profitPotential: 'Bajo',
      difficulty: 'easy'
    },
    {
      name: 'Hawaii',
      country_code: 'us',
      flagUrl: 'https://flagcdn.com/w80/us.png',
      time: '134',
      timeLabel: '2h 14m',
      items: ['Feathery Hotel Coupon'],
      description: 'Cupones de hotel, vacaciones',
      profitPotential: 'Medio',
      difficulty: 'medium'
    },
    {
      name: 'United Kingdom',
      country_code: 'gb',
      flagUrl: 'https://flagcdn.com/w80/gb.png',
      time: '159',
      timeLabel: '2h 39m',
      items: ['Fireworks'],
      description: 'Fuegos artificiales, eventos',
      profitPotential: 'Medio',
      difficulty: 'medium'
    },
    {
      name: 'Argentina',
      country_code: 'ar',
      flagUrl: 'https://flagcdn.com/w80/ar.png',
      time: '167',
      timeLabel: '2h 47m',
      items: ['Erotic DVD'],
      description: 'Entretenimiento adulto',
      profitPotential: 'Alto',
      difficulty: 'medium'
    },
    {
      name: 'Switzerland',
      country_code: 'ch',
      flagUrl: 'https://flagcdn.com/w80/ch.png',
      time: '175',
      timeLabel: '2h 55m',
      items: ['Box of Grenades'],
      description: 'Armamento, explosivos',
      profitPotential: 'Muy Alto',
      difficulty: 'hard'
    },
    {
      name: 'Japan',
      country_code: 'jp',
      flagUrl: 'https://flagcdn.com/w80/jp.png',
      time: '225',
      timeLabel: '3h 45m',
      items: ['Six-Pack of Energy Drink'],
      description: 'Bebidas energéticas, cultura',
      profitPotential: 'Medio',
      difficulty: 'hard'
    },
    {
      name: 'China',
      country_code: 'cn',
      flagUrl: 'https://flagcdn.com/w80/cn.png',
      time: '242',
      timeLabel: '4h 2m',
      items: ['Clothing Cache'],
      description: 'Ropa, moda, textiles',
      profitPotential: 'Alto',
      difficulty: 'hard'
    },
    {
      name: 'UAE',
      country_code: 'ae',
      flagUrl: 'https://flagcdn.com/w80/ae.png',
      time: '271',
      timeLabel: '4h 31m',
      items: ['Lottery Voucher'],
      description: 'Lotería, casino, lujo',
      profitPotential: 'Muy Alto',
      difficulty: 'hard'
    },
    {
      name: 'South Africa',
      country_code: 'za',
      flagUrl: 'https://flagcdn.com/w80/za.png',
      time: '297',
      timeLabel: '4h 57m',
      items: ['Drug Pack'],
      description: 'Drogas, medicina',
      profitPotential: 'Muy Alto',
      difficulty: 'hard'
    }
  ];

  constructor(public tornApi: TornApiService) {}

  ngOnInit(): void {
    // Suscribirse a datos de viaje
    const travelSub = this.tornApi.travel$.subscribe(travel => {
      this.currentTravel = travel;
    });
    this.subscriptions.push(travelSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get isTraveling(): boolean {
    if (!this.currentTravel) return false;
    return this.currentTravel.time_left > 0;
  }

  get travelDestination(): string {
    return this.currentTravel?.destination || 'Torn';
  }

  get timeLeft(): string {
    if (!this.currentTravel || this.currentTravel.time_left === 0) return '0m';
    return TornApiService.formatTime(this.currentTravel.time_left);
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'bg-primary/20 text-primary border-primary/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'hard': return 'bg-accent/20 text-accent border-accent/30';
      default: return 'bg-surface-border text-text-muted border-surface-border';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'Normal';
    }
  }
}
