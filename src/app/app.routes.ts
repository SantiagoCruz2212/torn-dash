import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'travel-radar',
    loadComponent: () => import('./features/travel-radar/travel-radar.component').then(m => m.TravelRadarComponent)
  },
  {
    path: 'company-manager',
    loadComponent: () => import('./features/company-manager/company-manager.component').then(m => m.CompanyManagerComponent)
  },
  {
    path: 'merit-hunter',
    loadComponent: () => import('./features/merit-hunter/merit-hunter.component').then(m => m.MeritHunterComponent)
  },
  {
    path: 'stock-roi',
    loadComponent: () => import('./features/stock-roi/stock-roi.component').then(m => m.StockRoiComponent)
  },
  {
    path: 'faction-war-room',
    loadComponent: () => import('./features/faction-war-room/faction-war-room.component').then(m => m.FactionWarRoomComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
