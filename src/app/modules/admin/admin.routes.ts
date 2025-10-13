import { Routes } from '@angular/router';
import { adminCanActivateChild } from '../../core/guards/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin.component').then(
        (m) => m.DashboardAdminComponent
      ),
    canActivateChild: [adminCanActivateChild],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './pages/components/dashboard-home/dashboard-home.component'
          ).then((m) => m.DashboardHomeComponent),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'الرئيسية', icon: 'pi pi-home', order: 1 },
        },
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/components/students/students.component').then(
            (m) => m.StudentsComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'إضافة طالب', icon: 'pi pi-user-plus', order: 2 },
        },
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/components/teachers/teachers.component').then(
            (m) => m.TeachersComponent
          ),
        data: {
          roles: ['admin'],
          nav: { label: 'المعلمين', icon: 'pi pi-users', order: 3 },
        },
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./pages/components/classes/classes.component').then(
            (m) => m.ClassesComponent
          ),
        data: {
          roles: ['admin'],
          nav: { label: 'جدولة الحصص', icon: 'pi pi-book', order: 4 },
        },
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/components/enrollments/enrollments.component').then(
            (m) => m.EnrollmentsComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'السجلات', icon: 'pi pi-file', order: 5 },
        },
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/components/attendance/attendance.component').then(
            (m) => m.AttendanceComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'الحضور والغياب', icon: 'pi pi-file-check', order: 6 },
        },
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/components/payments/payments.component').then(
            (m) => m.PaymentsComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'المدفوعات', icon: 'pi pi-dollar', order: 7 },
        },
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/components/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
        data: {
          roles: ['admin'],
          nav: { label: 'المصروفات', icon: 'pi pi-credit-card', order: 8 },
        },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/components/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'التقارير', icon: 'pi pi-chart-bar', order: 9 },
        },
      },
      {
        path: 'messaging',
        loadComponent: () =>
          import('./pages/components/messaging/messaging.component').then(
            (m) => m.MessagingComponent
          ),
        data: {
          roles: ['admin', 'staff'],
          nav: { label: 'الرسائل', icon: 'pi pi-envelope', order: 10 },
        },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/components/setting/setting.component').then(
            (m) => m.SettingComponent
          ),
        data: {
          roles: ['admin'],
          nav: { label: 'الإعدادات', icon: 'pi pi-cog', order: 11 },
        },
      },
    ],
  },
];
