import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';  // Assure-toi d'importer le guard

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],  // Protège cette route
  },
  {
    path: 'creer-data-sachet',
    loadComponent: () => import('./creer-data-sachet/creer-data-sachet.page').then( m => m.CreerDataSachetPage),
    canActivate: [AuthGuard],  // Protège cette route
  },
  {
    path: 'creer-data-palette',
    loadComponent: () => import('./creer-data-palette/creer-data-palette.page').then( m => m.CreerDataPalettePage),
    canActivate: [AuthGuard],  // Protège cette route
  },
  {
    path: 'creer-data-carton',
    loadComponent: () => import('./creer-data-carton/creer-data-carton.page').then( m => m.CreerDataCartonPage),
    canActivate: [AuthGuard],  // Protège cette route
  },
  
];
