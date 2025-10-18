import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { supabase } from '../../../../../core/services/supabase.client';
import { FormsModule } from '@angular/forms';

type ContactMsg = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  created_at: string;
};

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    FormsModule,
  ],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  providers: [MessageService],
})
export class MessagingComponent implements OnInit {
  loading = false;
  rows = 10;
  totalRecords = 0;
  data: ContactMsg[] = [];

  search = signal<string>('');
  dateRange = signal<Date[] | null>(null);

  showView = false;
  selected: ContactMsg | null = null;

  sortField: string = 'created_at';
  sortOrder: 1 | -1 = -1;

  ngOnInit() {
    this.loadMessages(0, this.rows);
  }

  onSearchInput(ev: Event) {
    const val = (ev.target as HTMLInputElement).value ?? '';
    this.search.set(val);
  }

  onDateSelect(date: Date) {
    const current = this.dateRange() ?? [];
    if (current.length === 0) {
      this.dateRange.set([date]);
    } else if (current.length === 1) {
      const arr = [current[0], date].sort((a, b) => +a - +b);
      this.dateRange.set(arr);
    } else {
      this.dateRange.set([date]);
    }
  }

  onDateClear() {
    this.dateRange.set(null);
  }

  async onLazy(event: any) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows;
    this.sortField = event.sortField || 'created_at';
    this.sortOrder = event.sortOrder === 1 ? 1 : -1;
    await this.loadMessages(first, rows);
  }

  async onSearch() {
    await this.loadMessages(0, this.rows);
  }

  async onClearFilters() {
    this.search.set('');
    this.dateRange.set(null);
    await this.loadMessages(0, this.rows);
  }

  async loadMessages(first: number, rows: number) {
    this.loading = true;
    try {
      let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order(this.sortField, { ascending: this.sortOrder === 1 });

      const q = this.search().trim();
      if (q) {
        query = query.or(
          `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,subject.ilike.%${q}%,message.ilike.%${q}%`
        );
      }

      const dr = this.dateRange();
      if (dr?.[0]) {
        const fromIso = new Date(dr[0]);
        fromIso.setHours(0, 0, 0, 0);
        query = query.gte('created_at', fromIso.toISOString());
      }
      if (dr?.[1]) {
        const toIso = new Date(dr[1]);
        toIso.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toIso.toISOString());
      }

      const { data, error, count } = await query.range(first, first + rows - 1);
      if (error) throw error;

      this.data = (data || []) as ContactMsg[];
      this.totalRecords = count || 0;
      this.rows = rows;
    } catch (e: any) {
      const msg = e?.message?.includes('permission denied')
        ? 'ليس لديك صلاحية لعرض الرسائل (Admin فقط).'
        : e?.message || 'تعذر جلب الرسائل';
      const svc = new MessageService();
      svc.add({ severity: 'error', summary: 'خطأ', detail: msg });
    } finally {
      this.loading = false;
    }
  }

  view(row: ContactMsg) {
    this.selected = row;
    this.showView = true;
  }

  closeDialog() {
    this.showView = false;
    this.selected = null;
  }

  fmt(d: string) {
    const date = new Date(d);
    return date.toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
