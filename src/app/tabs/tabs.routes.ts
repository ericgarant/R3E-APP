import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { connectGuard } from '../connect.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'alerts',
        loadComponent: () =>
          import('../alerts/alerts.page').then((m) => m.AlertsPage),
        canActivate: [connectGuard]
      },
      {
        path: 'map',
        loadComponent: () =>
          import('../map/map.page').then((m) => m.MapPage),
      },
      {
        path: 'location',
        loadComponent: () =>
          import('../location/location.page').then((m) => m.LocationPage),
      },
      
      {
        path: '',
        redirectTo: '/tabs/alerts',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/alerts',
    pathMatch: 'full',
  },
];
