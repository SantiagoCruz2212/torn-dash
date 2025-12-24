import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TornApiService, TornBars } from '../../../core/services/torn-api.service';

export interface UserData {
  player_id: number;
  name: string;
  level: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() userData: UserData | null = null;
  @Output() onLogout = new EventEmitter<void>();

  private subscriptions: Subscription[] = [];

  // Bars data
  bars = {
    energy: { current: 0, max: 0, percent: 0 },
    happy: { current: 0, max: 0, percent: 0 },
    nerve: { current: 0, max: 0, percent: 0 }
  };

  constructor(private tornApi: TornApiService) {}

  ngOnInit(): void {
    // Suscribirse a las barras
    const barsSub = this.tornApi.bars$.subscribe(bars => {
      if (bars) {
        this.updateBars(bars);
      }
    });
    this.subscriptions.push(barsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateBars(bars: TornBars): void {
    this.bars.energy = {
      current: bars.energy.current,
      max: bars.energy.maximum,
      percent: Math.round((bars.energy.current / bars.energy.maximum) * 100)
    };

    this.bars.happy = {
      current: bars.happy.current,
      max: bars.happy.maximum,
      percent: Math.round((bars.happy.current / bars.happy.maximum) * 100)
    };

    this.bars.nerve = {
      current: bars.nerve.current,
      max: bars.nerve.maximum,
      percent: Math.round((bars.nerve.current / bars.nerve.maximum) * 100)
    };
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión? Tendrás que ingresar tu API Key nuevamente.')) {
      this.onLogout.emit();
    }
  }

  getBarColor(percent: number): string {
    if (percent >= 75) return 'bg-primary';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-accent';
  }
}
