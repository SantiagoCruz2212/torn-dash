import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { tornLinkedGuard } from './core/guards/torn-linked.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile/link-torn',
    loadComponent: () => import('./features/profile/link-torn/link-torn.component').then(m => m.LinkTornComponent),
    canActivate: [authGuard]
  },
  {
    path: 'marketplace/browse',
    loadComponent: () => import('./features/marketplace/browse/browse.component').then(m => m.BrowseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'marketplace/create',
    loadComponent: () => import('./features/marketplace/create-listing/create-listing.component').then(m => m.CreateListingComponent),
    canActivate: [authGuard, tornLinkedGuard]
  },
  {
    path: 'marketplace/my-listings',
    loadComponent: () => import('./features/marketplace/my-listings/my-listings.component').then(m => m.MyListingsComponent),
    canActivate: [authGuard, tornLinkedGuard]
  },
  {
    path: 'transactions/purchases',
    loadComponent: () => import('./features/transactions/purchases/purchases.component').then(m => m.PurchasesComponent),
    canActivate: [authGuard, tornLinkedGuard]
  },
  {
    path: 'transactions/sales',
    loadComponent: () => import('./features/transactions/sales/sales.component').then(m => m.SalesComponent),
    canActivate: [authGuard, tornLinkedGuard]
  },
  {
    path: 'travel-radar',
    loadComponent: () => import('./features/travel-radar/travel-radar.component').then(m => m.TravelRadarComponent)
  },
  {
    path: 'get-target',
    loadComponent: () => import('./features/get-target/get-target.component').then(m => m.GetTargetComponent)
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
    path: 'market/comprar',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'market/vender',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
