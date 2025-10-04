import { Routes } from '@angular/router';
import { adminRoutes } from './modules/admin/admin.routes';

export const routes: Routes = [
  {
    path: 'admin',
    children: adminRoutes,
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
];
