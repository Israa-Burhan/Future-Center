import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute, RouterModule, Route } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth.service';
import { supabase } from '../../../../core/services/supabase.client';

type NavMeta = {
  label?: string;
  icon?: string;
  order?: number;
  hidden?: boolean;
};
interface MenuItem {
  label: string;
  icon?: string;
  route: string;
  order: number;
}
type Role = 'admin' | 'staff';
@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, InputTextModule, ButtonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent implements OnInit {
  isCollapsed = false;
  isExpanded = false;
  isBrowser = false;
  isMobile = false;

  menuItems: MenuItem[] = [];
  userName: string = 'مستخدم';
  userRoleLabel: string = 'الأدمن';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // menuItems = [
  //   { label: 'الرئيسية', icon: 'pi pi-home', route: 'dashboard' },
  //   { label: 'إضافة طالب', icon: 'pi pi-user-plus', route: 'students' },
  //   {
  //     label: ' المعلمين',
  //     icon: 'pi pi-users',
  //     route: 'teachers',
  //   },
  //   { label: 'جدولة الحصص', icon: 'pi pi-book', route: 'classes' },
  //   { label: 'السجلات', icon: 'pi pi-file', route: 'enrollments' },
  //   {
  //     label: 'الحضور والغياب',
  //     icon: 'pi pi-file-check',
  //     route: 'attendance',
  //   },
  //   {
  //     label: 'المدفوعات',
  //     icon: 'pi pi-dollar',
  //     route: 'payments',
  //   },
  //   { label: 'المصروفات', icon: 'pi pi-credit-card', route: 'expenses' },
  //   { label: 'التقارير', icon: 'pi pi-chart-bar', route: 'reports' },
  //   { label: 'الرسائل', icon: 'pi pi-envelope', route: 'messaging' },
  //   { label: 'الإعدادات', icon: 'pi pi-cog', route: 'settings' },
  // ];
  ngOnInit(): void {
    if (this.isBrowser) {
      const saved = localStorage.getItem('admin.sidebar.collapsed');
      this.isCollapsed = saved ? saved === 'true' : window.innerWidth < 992;
      this.isMobile = window.matchMedia('(max-width: 991px)').matches;
    }
    void this.buildMenuFromRoutes();
    void this.initUserInfo();
  }

  private async buildMenuFromRoutes() {
    const role = await this.auth.getRole().catch(() => null);
    const roles = role ? [role as Role] : ([] as Role[]);
    const current = this.route.snapshot.routeConfig;
    const children = (current?.children ?? []) as Route[];

    const items: MenuItem[] = [];
    items.push({
      label: 'العودة للموقع',
      icon: 'pi pi-globe',
      route: '/',
      order: 0,
    });

    for (const r of children) {
      if (r.redirectTo) continue;
      const nav = r.data?.['nav'] as NavMeta | undefined;
      const required = (r.data?.['roles'] as Role[] | undefined) ?? [];
      if (nav?.hidden) continue;
      const allowed =
        !required.length || required.some((rr) => roles.includes(rr));
      if (!allowed) continue;

      const label = nav?.label ?? this.fallbackLabel(r.path ?? '');
      const icon = nav?.icon ?? 'pi pi-circle';
      const order = nav?.order ?? 999;

      items.push({
        label,
        icon,
        route: r.path ?? '',
        order,
      });
    }

    this.menuItems = items.sort((a, b) => a.order - b.order);
  }
  private fallbackLabel(path: string) {
    return path.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;
    this.isCollapsed = window.innerWidth < 992;
    this.isMobile = window.matchMedia('(max-width: 991px)').matches;
    localStorage.setItem('admin.sidebar.collapsed', String(this.isCollapsed));
  }

  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   if (this.isBrowser) {
  //     this.isCollapsed = window.innerWidth < 992;
  //   }
  // }

  expandSidebar() {
    if (this.isCollapsed) this.isExpanded = true;
  }

  collapseSidebar() {
    if (this.isCollapsed) this.isExpanded = false;
  }

  ngOnDestroy() {
    document.body.classList.remove('dashboard-active');
  }

  async signOut() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  private async initUserInfo() {
    const session = await this.auth.getSession();
    const role = await this.auth.getRole();

    const uid = session?.user?.id;
    let nameFromProfile: string | null = null;

    if (uid) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', uid)
        .single();
      nameFromProfile = data?.full_name ?? null;
    }

    this.userName =
      nameFromProfile ||
      session?.user?.user_metadata?.['full_name'] ||
      session?.user?.email ||
      'مستخدم';

    this.userRoleLabel = role === 'admin' ? 'الأدمن' : 'الموظّف';
  }
}
