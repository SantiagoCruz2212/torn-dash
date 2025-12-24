import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiKeyService } from '../../../core/services/api-key.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Travel Radar', icon: 'flight_takeoff', route: '/travel-radar' },
    { label: 'Company Manager', icon: 'business_center', route: '/company-manager' },
    { label: 'Merit Hunter', icon: 'military_tech', route: '/merit-hunter' },
    { label: 'Stock ROI', icon: 'monitoring', route: '/stock-roi' },
    { label: 'Faction War Room', icon: 'swords', route: '/faction-war-room' }
  ];

  constructor(public apiKeyService: ApiKeyService) {}

  ngOnInit(): void {
    // Los datos del usuario ya están disponibles en apiKeyService.userData
  }

  get userName(): string {
    return this.apiKeyService.userData?.name || 'Unknown';
  }

  get userLevel(): number {
    return this.apiKeyService.userData?.level || 0;
  }
}
