import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { forkJoin, take } from 'rxjs';

import {
  DashboardService,
  DashboardStats,
  MonthlyTrendPoint,
} from '../../../../../core/services/dashboard.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

interface StatCard {
  id: string;
  title: string;
  value: string;
  delta: string;
  deltaClass: 'up' | 'down';
  icon: string;
}

interface QuickLink {
  label: string;
  route: string[];
  icon: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, SpinnerComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboard = inject(DashboardService);
  private readonly notification = inject(NotificationService);

  loading = true;
  statCards: StatCard[] = [];
  detailCards: StatCard[] = [];
  monthlyTrend: MonthlyTrendPoint[] = [];
  maxTrendRevenue = 1;
  maxTrendStudents = 1;

  readonly quickLinks: QuickLink[] = [
    { label: 'إضافة طالب', route: ['/admin', 'students'], icon: 'pi pi-user-plus' },
    { label: 'المعلمين', route: ['/admin', 'teachers'], icon: 'pi pi-users' },
    { label: 'جدولة الحصص', route: ['/admin', 'classes'], icon: 'pi pi-calendar' },
    { label: 'المواد الدراسية', route: ['/admin', 'subjects'], icon: 'pi pi-book' },
    { label: 'مدفوعات الطلاب', route: ['/admin', 'student-price-summary'], icon: 'pi pi-dollar' },
    { label: 'مدفوعات المعلمين', route: ['/admin', 'payments'], icon: 'pi pi-wallet' },
    { label: 'الحضور والغياب', route: ['/admin', 'attendance'], icon: 'pi pi-check-square' },
    { label: 'التقارير', route: ['/admin', 'reports'], icon: 'pi pi-chart-bar' },
  ];

  ngOnInit(): void {
    forkJoin({
      stats: this.dashboard.loadStats(),
      trend: this.dashboard.loadMonthlyTrend(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ stats, trend }) => {
          this.statCards = this.mapToCards(stats);
          this.detailCards = this.mapDetailCards(stats);
          this.monthlyTrend = trend;
          this.maxTrendRevenue = Math.max(
            ...trend.map((t) => t.revenue),
            1
          );
          this.maxTrendStudents = Math.max(
            ...trend.map((t) => t.newStudents),
            1
          );
          this.loading = false;
        },
        error: (err) => {
          console.error('Dashboard stats', err);
          this.notification.showError(
            'تعذّر تحميل أرقام لوحة التحكم. حاول مرة أخرى.'
          );
          this.statCards = this.fallbackCards();
          this.detailCards = this.fallbackDetailCards();
          this.monthlyTrend = [];
          this.loading = false;
        },
      });
  }

  revenueBarPercent(row: MonthlyTrendPoint): number {
    if (this.maxTrendRevenue <= 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((row.revenue / this.maxTrendRevenue) * 100)
    );
  }

  studentsBarPercent(row: MonthlyTrendPoint): number {
    if (this.maxTrendStudents <= 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((row.newStudents / this.maxTrendStudents) * 100)
    );
  }

  private mapToCards(s: DashboardStats): StatCard[] {
    const int = (n: number) =>
      new Intl.NumberFormat('ar-EG').format(Math.max(0, Math.round(n)));
    const money = (n: number) =>
      new Intl.NumberFormat('ar-EG', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(Math.max(0, Math.round(n)));

    const pctDiff = (
      current: number,
      previous: number
    ): { text: string; cls: 'up' | 'down' } => {
      if (previous === 0 && current === 0) {
        return { text: '0٪', cls: 'up' };
      }
      if (previous === 0) {
        return { text: '+100٪', cls: 'up' };
      }
      const pct = ((current - previous) / previous) * 100;
      const sign = pct > 0 ? '+' : '';
      return {
        text: `${sign}${pct.toFixed(1).replaceAll('.', '٫')}٪`,
        cls: pct >= 0 ? 'up' : 'down',
      };
    };

    const newShare =
      s.totalStudents > 0
        ? ((s.newStudentsThisMonth / s.totalStudents) * 100).toFixed(1)
        : '0';
    const newShareLabel = `${newShare.replaceAll('.', '٫')}٪ من إجمالي الطلاب`;

    const newMoM = pctDiff(
      s.newStudentsThisMonth,
      s.newStudentsLastMonth
    );
    const revMoM = pctDiff(s.revenueThisMonth, s.revenueLastMonth);

    return [
      {
        id: 'totalStudents',
        title: 'عدد الطلاب (السجل)',
        value: int(s.totalStudents),
        delta: newShareLabel,
        deltaClass: 'up',
        icon: 'pi pi-users',
      },
      {
        id: 'newStudents',
        title: 'طلاب جدد هذا الشهر',
        value: int(s.newStudentsThisMonth),
        delta: newMoM.text,
        deltaClass: newMoM.cls,
        icon: 'pi pi-user-plus',
      },
      {
        id: 'instructors',
        title: 'المعلمون المسجّلون',
        value: int(s.distinctTeachers),
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-briefcase',
      },
      {
        id: 'revenue',
        title: 'تحصيلات مدفوعة (الشهر الحالي)',
        value: `${money(s.revenueThisMonth)} ج.م`,
        delta: revMoM.text,
        deltaClass: revMoM.cls,
        icon: 'pi pi-wallet',
      },
    ];
  }

  private mapDetailCards(s: DashboardStats): StatCard[] {
    const int = (n: number) =>
      new Intl.NumberFormat('ar-EG').format(Math.max(0, Math.round(n)));
    return [
      {
        id: 'activeStudents',
        title: 'طلاب «فعّال»',
        value: int(s.activeStudentsCount),
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-check-circle',
      },
      {
        id: 'subjects',
        title: 'مواد مسجّلة',
        value: int(s.subjectsCount),
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-book',
      },
      {
        id: 'scheduleRows',
        title: 'صفوف جدول الحصص',
        value: int(s.scheduleRowsCount),
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-table',
      },
    ];
  }

  private fallbackCards(): StatCard[] {
    return [
      {
        id: 'totalStudents',
        title: 'عدد الطلاب (السجل)',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-users',
      },
      {
        id: 'newStudents',
        title: 'طلاب جدد هذا الشهر',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-user-plus',
      },
      {
        id: 'instructors',
        title: 'المعلمون المسجّلون',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-briefcase',
      },
      {
        id: 'revenue',
        title: 'تحصيلات مدفوعة (الشهر الحالي)',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-wallet',
      },
    ];
  }

  private fallbackDetailCards(): StatCard[] {
    return [
      {
        id: 'activeStudents',
        title: 'طلاب «فعّال»',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-check-circle',
      },
      {
        id: 'subjects',
        title: 'مواد مسجّلة',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-book',
      },
      {
        id: 'scheduleRows',
        title: 'صفوف جدول الحصص',
        value: '—',
        delta: '',
        deltaClass: 'up',
        icon: 'pi pi-table',
      },
    ];
  }
}
