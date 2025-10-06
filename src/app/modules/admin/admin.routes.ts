import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin.component').then(
        (m) => m.DashboardAdminComponent
      ),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './pages/components/dashboard-home/dashboard-home.component'
          ).then((m) => m.DashboardHomeComponent),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/components/students/students.component').then(
            (m) => m.StudentsComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./pages/components/classes/classes.component').then(
            (m) => m.ClassesComponent
          ),
        data: { roles: ['admin'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/components/enrollments/enrollments.component').then(
            (m) => m.EnrollmentsComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/components/attendance/attendance.component').then(
            (m) => m.AttendanceComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/components/payments/payments.component').then(
            (m) => m.PaymentsComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/components/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/components/teachers/teachers.component').then(
            (m) => m.TeachersComponent
          ),
        data: { roles: ['admin'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/components/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
        data: { roles: ['admin'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'messaging',
        loadComponent: () =>
          import('./pages/components/messaging/messaging.component').then(
            (m) => m.MessagingComponent
          ),
        data: { roles: ['admin', 'staff'] },
        canActivate: [AuthGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/components/setting/setting.component').then(
            (m) => m.SettingComponent
          ),
        data: { roles: ['admin'] },
        canActivate: [AuthGuard],
      },
    ],
  },
];
