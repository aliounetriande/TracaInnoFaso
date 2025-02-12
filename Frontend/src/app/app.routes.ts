import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'creer-data-sachet',
    loadComponent: () => import('./creer-data-sachet/creer-data-sachet.page').then( m => m.CreerDataSachetPage)
  },
  {
    path: 'creer-data-palette',
    loadComponent: () => import('./creer-data-palette/creer-data-palette.page').then( m => m.CreerDataPalettePage)
  },
  {
    path: 'creer-data-carton',
    loadComponent: () => import('./creer-data-carton/creer-data-carton.page').then( m => m.CreerDataCartonPage)
  },
];
