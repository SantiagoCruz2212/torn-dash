import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';

interface Employee {
  id: number;
  name: string;
  position: string;
  effectiveness: number;
  wage: number;
  status: 'working' | 'idle' | 'traveling' | 'hospital';
  lastAction: string;
}

interface CompanyStats {
  production: number;
  maxProduction: number;
  efficiency: number;
  employees: number;
  maxEmployees: number;
}

interface CompanyInfo {
  name: string;
  type: string;
  rating: number;
  days_old: number;
  director: string;
}

@Component({
  selector: 'app-company-manager',
  imports: [CommonModule, AdBannerComponent],
  templateUrl: './company-manager.component.html',
  styleUrl: './company-manager.component.css'
})
export class CompanyManagerComponent implements OnInit {
  companyInfo: CompanyInfo = {
    name: 'WolfTech Industries',
    type: 'Private Security',
    rating: 4,
    days_old: 245,
    director: 'TheWolfDev'
  };

  stats: CompanyStats = {
    production: 1250,
    maxProduction: 2000,
    efficiency: 85,
    employees: 8,
    maxEmployees: 10
  };

  employees: Employee[] = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Manager',
      effectiveness: 95,
      wage: 5000,
      status: 'working',
      lastAction: 'Hace 2h'
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Secretary',
      effectiveness: 88,
      wage: 3500,
      status: 'working',
      lastAction: 'Hace 1h'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Security Guard',
      effectiveness: 92,
      wage: 4200,
      status: 'working',
      lastAction: 'Hace 30m'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      position: 'Accountant',
      effectiveness: 78,
      wage: 4000,
      status: 'idle',
      lastAction: 'Hace 5h'
    },
    {
      id: 5,
      name: 'David Brown',
      position: 'Security Guard',
      effectiveness: 85,
      wage: 4200,
      status: 'working',
      lastAction: 'Hace 45m'
    },
    {
      id: 6,
      name: 'Emily Davis',
      position: 'Cleaner',
      effectiveness: 70,
      wage: 2500,
      status: 'working',
      lastAction: 'Hace 3h'
    },
    {
      id: 7,
      name: 'Robert Wilson',
      position: 'Security Guard',
      effectiveness: 90,
      wage: 4200,
      status: 'traveling',
      lastAction: 'Hace 6h'
    },
    {
      id: 8,
      name: 'Lisa Martinez',
      position: 'Secretary',
      effectiveness: 65,
      wage: 3500,
      status: 'hospital',
      lastAction: 'Hace 12h'
    }
  ];

  // Financial data
  weeklyIncome = 125000;
  weeklyExpenses = 89500;
  weeklyProfit = 35500;

  // Production history for chart
  productionHistory = [65, 72, 68, 85, 78, 90, 85];

  ngOnInit(): void {
    // Aquí se podría cargar datos reales de la API cuando esté disponible
  }

  get productionPercent(): number {
    return Math.round((this.stats.production / this.stats.maxProduction) * 100);
  }

  get employeePercent(): number {
    return Math.round((this.stats.employees / this.stats.maxEmployees) * 100);
  }

  get workingEmployees(): number {
    return this.employees.filter(e => e.status === 'working').length;
  }

  get averageEffectiveness(): number {
    const sum = this.employees.reduce((acc, emp) => acc + emp.effectiveness, 0);
    return Math.round(sum / this.employees.length);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'working': return 'bg-primary/20 text-primary border-primary/30';
      case 'idle': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'traveling': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'hospital': return 'bg-accent/20 text-accent border-accent/30';
      default: return 'bg-surface-border text-text-muted border-surface-border';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'working': return 'Trabajando';
      case 'idle': return 'Inactivo';
      case 'traveling': return 'Viajando';
      case 'hospital': return 'Hospital';
      default: return 'Desconocido';
    }
  }

  getEffectivenessClass(effectiveness: number): string {
    if (effectiveness >= 85) return 'text-primary';
    if (effectiveness >= 70) return 'text-yellow-500';
    if (effectiveness >= 50) return 'text-orange-500';
    return 'text-accent';
  }

  getRatingStars(): string[] {
    return Array(5).fill('').map((_, i) => i < this.companyInfo.rating ? 'star' : 'star_outline');
  }
}
