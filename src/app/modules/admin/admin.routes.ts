import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin.component').then(
        (m) => m.DashboardAdminComponent
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import(
            './pages/components/dashboard-home/dashboard-home.component'
          ).then((m) => m.DashboardHomeComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/components/students/students.component').then(
            (m) => m.StudentsComponent
          ),
      },
      // { path: 'classes', component: ClassesComponent },
      // { path: 'records', component: RecordsComponent },
      // { path: 'statistics', component: StatisticsComponent },
      // { path: 'settings', component: SettingsComponent },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/components/teachers/teachers.component').then(
            (m) => m.TeachersComponent
          ),
      },
    ],
  },
];
