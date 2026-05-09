import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, map } from 'rxjs';
import { supabase } from './supabase.client';

export interface DashboardStats {
  totalStudents: number;
  newStudentsThisMonth: number;
  newStudentsLastMonth: number;
  distinctTeachers: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  subjectsCount: number;
  scheduleRowsCount: number;
  activeStudentsCount: number;
}

/** آخر 6 أشهر — تحصيلات مدفوعة + طلاب جدد بحسب شهر التسجيل */
export interface MonthlyTrendPoint {
  monthKey: string;
  label: string;
  revenue: number;
  newStudents: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /** Keys match PaymentService / DB: first day of month as YYYY-MM-DD */
  private monthYearKey(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .substring(0, 10);
  }

  private monthStart(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  }

  loadStats(): Observable<DashboardStats> {
    const now = new Date();
    const thisMonthStart = this.monthStart(now);
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      0,
      0,
      0,
      0
    );
    const keyThis = this.monthYearKey(now);
    const keyLast = this.monthYearKey(lastMonthStart);

    const totalStudents$ = from(
      supabase.from('students').select('*', { count: 'exact', head: true })
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const newStudentsThisMonth$ = from(
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString())
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const newStudentsLastMonth$ = from(
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', thisMonthStart.toISOString())
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const distinctTeachers$ = from(
      supabase.from('teachers').select('*', { count: 'exact', head: true })
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const revenueThisMonth$ = from(
      supabase
        .from('student_payments')
        .select('final_price')
        .eq('month_year', keyThis)
        .eq('is_paid', true)
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        const rows = (r.data ?? []) as { final_price: number | string }[];
        return rows.reduce((s, row) => s + Number(row.final_price), 0);
      })
    );

    const revenueLastMonth$ = from(
      supabase
        .from('student_payments')
        .select('final_price')
        .eq('month_year', keyLast)
        .eq('is_paid', true)
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        const rows = (r.data ?? []) as { final_price: number | string }[];
        return rows.reduce((s, row) => s + Number(row.final_price), 0);
      })
    );

    const subjectsCount$ = from(
      supabase.from('subjects').select('*', { count: 'exact', head: true })
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const scheduleRowsCount$ = from(
      supabase
        .from('class_schedule')
        .select('*', { count: 'exact', head: true })
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    const activeStudentsCount$ = from(
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'فعّال')
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        return r.count ?? 0;
      })
    );

    return forkJoin({
      totalStudents: totalStudents$,
      newStudentsThisMonth: newStudentsThisMonth$,
      newStudentsLastMonth: newStudentsLastMonth$,
      distinctTeachers: distinctTeachers$,
      revenueThisMonth: revenueThisMonth$,
      revenueLastMonth: revenueLastMonth$,
      subjectsCount: subjectsCount$,
      scheduleRowsCount: scheduleRowsCount$,
      activeStudentsCount: activeStudentsCount$,
    });
  }

  /**
   * يعرض اتجاه الإيراد (تحصيلات الطلاب المدفوعة) وعدد الطلاب المسجّلين حديثًا لكل شهر.
   */
  loadMonthlyTrend(): Observable<MonthlyTrendPoint[]> {
    const now = new Date();
    const keys: string[] = [];
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(this.monthYearKey(d));
      labels.push(
        new Intl.DateTimeFormat('ar-EG', {
          month: 'long',
          year: 'numeric',
        }).format(d)
      );
    }

    const payments$ = from(
      supabase
        .from('student_payments')
        .select('month_year, final_price')
        .eq('is_paid', true)
        .in('month_year', keys)
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        const sums = new Map<string, number>();
        keys.forEach((k) => sums.set(k, 0));
        for (const row of (r.data ?? []) as {
          month_year: string;
          final_price: number | string;
        }[]) {
          const k = row.month_year;
          if (sums.has(k)) {
            sums.set(k, (sums.get(k) ?? 0) + Number(row.final_price));
          }
        }
        return sums;
      })
    );

    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const students$ = from(
      supabase
        .from('students')
        .select('created_at')
        .gte('created_at', rangeStart.toISOString())
    ).pipe(
      map((r) => {
        if (r.error) {
          throw r.error;
        }
        const counts = new Map<string, number>();
        keys.forEach((k) => counts.set(k, 0));
        for (const row of (r.data ?? []) as { created_at: string }[]) {
          const k = this.monthYearKey(new Date(row.created_at));
          if (counts.has(k)) {
            counts.set(k, (counts.get(k) ?? 0) + 1);
          }
        }
        return counts;
      })
    );

    return forkJoin({ sums: payments$, counts: students$ }).pipe(
      map(({ sums, counts }) =>
        keys.map((monthKey, idx) => ({
          monthKey,
          label: labels[idx],
          revenue: sums.get(monthKey) ?? 0,
          newStudents: counts.get(monthKey) ?? 0,
        }))
      )
    );
  }
}
