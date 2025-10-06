import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { loginBlockGuard } from './core/guards/login-block.guard';
import { publicRoutes } from './modules/public/public.routes';

export const routes: Routes = [
  // Public
  {
    path: '',
    children: publicRoutes,
  },
  // Auth
  {
    path: 'login',
    canMatch: [loginBlockGuard],
    loadComponent: () =>
      import('./modules/auth/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Admin
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/admin/admin.routes').then((m) => m.adminRoutes),
  },

  // Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./modules/shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
