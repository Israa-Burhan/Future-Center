import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent {
  isCollapsed: boolean = false;
  isExpanded: boolean = false;
  isBrowser: boolean = false;
  // expanded overlay on small screens
  isMobile = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  menuItems = [
    { label: 'الرئيسية', icon: 'pi pi-home', route: 'dashboard' },
    { label: 'إضافة طالب', icon: 'pi pi-user-plus', route: 'students' },
    {
      label: ' المعلمين',
      icon: 'pi pi-users',
      route: 'teachers',
    },
    { label: 'الصفوف', icon: 'pi pi-book', route: 'classes' },
    { label: 'السجلات', icon: 'pi pi-file', route: 'enrollments' },
    {
      label: 'الحضور والغياب',
      icon: 'pi pi-file-check',
      route: 'attendance',
    },
    {
      label: 'المدفوعات',
      icon: 'pi pi-dollar',
      route: 'payments',
    },
    { label: 'المصروفات', icon: 'pi pi-credit-card', route: 'expenses' },
    { label: 'التقارير', icon: 'pi pi-chart-bar', route: 'reports' },
    { label: 'الرسائل', icon: 'pi pi-envelope', route: 'messaging' },
    { label: 'الإعدادات', icon: 'pi pi-cog', route: 'settings' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isBrowser) {
      this.isCollapsed = window.innerWidth < 992;
    }
  }

  expandSidebar() {
    if (this.isCollapsed) this.isExpanded = true;
  }

  collapseSidebar() {
    if (this.isCollapsed) this.isExpanded = false;
  }
}
