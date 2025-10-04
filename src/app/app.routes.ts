import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { loginBlockGuard } from './core/guards/login-block.guard';

export const routes: Routes = [
  // Public
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./modules/public/pages/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./modules/public/pages/teachers/teachers.component').then(
        (m) => m.TeachersComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./modules/public/pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
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
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './modules/admin/pages/dashboard-admin/dashboard-admin.component'
          ).then((m) => m.DashboardAdminComponent),
      },
      {
        path: 'students',
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] },
        loadComponent: () =>
          import(
            './modules/admin/pages/components/students/students.component'
          ).then((m) => m.StudentsComponent),
      },
      // { path: 'classes',     canActivate: [AuthGuard], data: { roles: ['admin'] },
      //   loadComponent: () => import('./modules/admin/pages/components/classes/classes.component').then(m => m.ClassesComponent) },
      // { path: 'enrollments', canActivate: [AuthGuard], data: { roles: ['admin','staff'] },
      //   loadComponent: () => import('./modules/admin/pages/components/enrollments/enrollments.component').then(m => m.EnrollmentsComponent) },
      {
        path: 'attendance',
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] },
        loadComponent: () =>
          import(
            './modules/admin/pages/components/attendance/attendance.component'
          ).then((m) => m.AttendanceComponent),
      },
      // { path: 'payments',    canActivate: [AuthGuard], data: { roles: ['admin','staff'] },
      //   loadComponent: () => import('./modules/admin/pages/components/payments/payments.component').then(m => m.PaymentsComponent) },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] },
        loadComponent: () =>
          import(
            './modules/admin/pages/components/reports/reports.component'
          ).then((m) => m.ReportsComponent),
      },
      // (Admin only)
      {
        path: 'teachers',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import(
            './modules/admin/pages/components/teachers/teachers.component'
          ).then((m) => m.TeachersComponent),
      },
      {
        path: 'expenses',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import(
            './modules/admin/pages/components/expenses/expenses.component'
          ).then((m) => m.ExpensesComponent),
      },
      // { path: 'messaging',   canActivate: [AuthGuard], data: { roles: ['admin','staff'] },
      //   loadComponent: () => import('./modules/admin/pages/components/messaging/messaging.component').then(m => m.MessagingComponent) },
    ],
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
