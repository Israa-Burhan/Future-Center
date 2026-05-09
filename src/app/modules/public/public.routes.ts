import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public-layout/public-layout.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
        data: {
          seo: {
            title:
              'Future Center — سنتر مستقبل للتعليم | الرئيسية',
            description:
              'سنتر تعليمي — حصص منظمة، مواد متنوعة، فريق معلمين، وتسجيل سهل. مستقبل للتعليم في خدمة الطلاب والأسر.',
            keywords:
              'سنتر دروس، مستقبل للتعليم، حصص تقوية، مواعيد سنتر، تسجيل طلاب',
          },
        },
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/teachers/teachers.component').then(
            (m) => m.TeachersComponent
          ),
        data: {
          seo: {
            title: 'المعلمون | Future Center — سنتر مستقبل للتعليم',
            description:
              'تعرّف على فريق المعلمين في سنتر مستقبل للتعليم — خبرات أكاديمية واهتمام بالطلاب.',
            keywords:
              'معلمو سنتر، هيئة تدريس، مستقبل للتعليم، معلمين تجاري وفني',
          },
        },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
        data: {
          seo: {
            title: 'تواصل معنا | Future Center — سنتر مستقبل للتعليم',
            description:
              'أرقام التواصل، الموقع، وسائل التواصل الاجتماعي — سنتر مستقبل للتعليم.',
            keywords:
              'تواصل سنتر، عنوان سنتر، مواعيد عمل، مستقبل للتعليم',
          },
        },
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./pages/faq/faq.component').then((m) => m.FaqComponent),
        data: {
          seo: {
            title: 'الأسئلة الشائعة | Future Center — سنتر مستقبل للتعليم',
            description:
              'إجابات عن التسجيل، المواعيد، المواد، والسياسات في سنتر مستقبل للتعليم.',
            keywords:
              'أسئلة شائعة سنتر، تسجيل دروس، سياسة الحضور، مستقبل للتعليم',
          },
        },
      },
    ],
  },
];
