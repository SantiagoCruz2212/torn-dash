import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';
import { AdBoxComponent } from '../../shared/components/ad-box/ad-box.component';
import { TornApiService, TornBars, TornStock } from '../../core/services/torn-api.service';

interface TravelDestination {
  country: string;
  flagUrl: string;
  flightTime: string;
  itemCost: string;
  profit: string;
  profitLabel: string;
  profitClass: string;
  trend: number[];
  trendClass: string;
}

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  change: string;
  price: string;
  changeClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdBannerComponent, AdBoxComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Stats
  stats = {
    energy: { current: 0, max: 0, percent: 0, regen: '', fulltime: 0 },
    happy: { current: 0, max: 0, percent: 0, fulltime: 0 },
    nerve: { current: 0, max: 0, percent: 0, fulltime: 0 },
    life: { current: 0, max: 0, percent: 0 }
  };

  // Travel destinations (reduced to 3 for compact view)
  travelDestinations: TravelDestination[] = [
    {
      country: 'United Kingdom',
      flagUrl: 'https://flagcdn.com/w40/gb.png',
      flightTime: '3h 45m',
      itemCost: '$12,500',
      profit: '+$1.2m',
      profitLabel: 'per run',
      profitClass: 'text-primary',
      trend: [60, 50, 90, 70],
      trendClass: 'bg-primary'
    },
    {
      country: 'Argentina',
      flagUrl: 'https://flagcdn.com/w40/ar.png',
      flightTime: '2h 15m',
      itemCost: '$4,200',
      profit: '+$850k',
      profitLabel: 'per run',
      profitClass: 'text-primary',
      trend: [40, 60, 30, 80],
      trendClass: 'bg-primary'
    },
    {
      country: 'China',
      flagUrl: 'https://flagcdn.com/w40/cn.png',
      flightTime: '4h 10m',
      itemCost: '$15,000',
      profit: '-$20k',
      profitLabel: 'saturated',
      profitClass: 'text-accent',
      trend: [80, 60, 40, 20],
      trendClass: 'bg-accent'
    }
  ];

  // Stock data
  stocks: Stock[] = [];
  topStocks: Stock[] = [];

  // War status
  warStatus = {
    enemy: 'The 39th Street',
    yourPercent: 65,
    enemyPercent: 35
  };

  // Networth
  networth = {
    total: 0,
    wallet: 0,
    bank: 0,
    points: 0
  };

  constructor(public tornApi: TornApiService) {}

  ngOnInit(): void {
    // Suscribirse a las actualizaciones de bars
    const barsSub = this.tornApi.bars$.subscribe(bars => {
      if (bars) {
        this.updateStats(bars);
      }
    });
    this.subscriptions.push(barsSub);

    // Suscribirse a las actualizaciones de stocks
    const stocksSub = this.tornApi.stocks$.subscribe(stocks => {
      if (stocks) {
        this.updateStocks(stocks);
      }
    });
    this.subscriptions.push(stocksSub);

    // Suscribirse a networth
    const networthSub = this.tornApi.networth$.subscribe(networth => {
      if (networth) {
        this.networth = {
          total: networth.total,
          wallet: networth.wallet,
          bank: networth.bank,
          points: networth.points
        };
      }
    });
    this.subscriptions.push(networthSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateStats(bars: TornBars): void {
    this.stats.energy = {
      current: bars.energy.current,
      max: bars.energy.maximum,
      percent: Math.round((bars.energy.current / bars.energy.maximum) * 100),
      regen: `+${bars.energy.increment} every ${bars.energy.interval / 60}m`,
      fulltime: bars.energy.fulltime
    };

    this.stats.happy = {
      current: bars.happy.current,
      max: bars.happy.maximum,
      percent: Math.round((bars.happy.current / bars.happy.maximum) * 100),
      fulltime: bars.happy.fulltime
    };

    this.stats.nerve = {
      current: bars.nerve.current,
      max: bars.nerve.maximum,
      percent: Math.round((bars.nerve.current / bars.nerve.maximum) * 100),
      fulltime: bars.nerve.fulltime
    };

    this.stats.life = {
      current: bars.life.current,
      max: bars.life.maximum,
      percent: Math.round((bars.life.current / bars.life.maximum) * 100)
    };
  }

  private updateStocks(stocksData: { [key: string]: TornStock }): void {
    const stocksArray = Object.values(stocksData);

    // Convertir a formato del dashboard
    this.stocks = stocksArray.map(stock => ({
      symbol: stock.acronym,
      name: stock.name,
      sector: stock.benefit.type,
      change: '',
      price: `$${TornApiService.formatCompactNumber(stock.current_price)}`,
      changeClass: 'text-primary'
    }));

    // Obtener los top 3 stocks por precio
    this.topStocks = [...this.stocks]
      .sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[$,]/g, ''));
        const priceB = parseFloat(b.price.replace(/[$,]/g, ''));
        return priceB - priceA;
      })
      .slice(0, 3);
  }

  formatNumber(num: number): string {
    return TornApiService.formatNumber(num);
  }

  formatCompactNumber(num: number): string {
    return TornApiService.formatCompactNumber(num);
  }

  formatTime(seconds: number): string {
    return TornApiService.formatTime(seconds);
  }
}
