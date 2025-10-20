import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { supabase } from '../../../../../core/services/supabase.client';

// RxWeb
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { FormsModule } from '@angular/forms';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';

type Expense = {
  id: string;
  kind: string;
  amount: number;
  spent_at: string;
  description: string | null;
  created_at: string;
};

const EXPENSE_KINDS = [
  { label: 'إيجار', value: 'rent' },
  { label: 'مرتبات', value: 'salaries' },
  { label: 'كهرباء', value: 'electricity' },
  { label: 'مياه', value: 'water' },
  { label: 'إنترنت', value: 'internet' },
  { label: 'أدوات مكتبية', value: 'stationery' },
  { label: 'صيانة', value: 'maintenance' },
  { label: 'أخرى', value: 'other' },
] as const;
type ExpenseKind = (typeof EXPENSE_KINDS)[number]['value'];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ValidationMessagePage,
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ExpensesComponent implements OnInit {
  loading = false;
  rows = 10;
  totalRecords = 0;
  data: Expense[] = [];

  q = signal<string>('');
  dateRange = signal<Date[] | null>(null);
  sortField: string = 'spent_at';
  sortOrder: 1 | -1 = -1;

  showEditor = false;
  editingId: string | null = null;

  monthTotal = signal<number>(0);

  kinds = [...EXPENSE_KINDS];
  private allowedKinds: ExpenseKind[] = this.kinds.map((k) => k.value);

  formExpense = this.fb.group({
    kind: [
      '',
      [
        RxwebValidators.required({ message: 'اختر نوع المصروف' }),
        RxwebValidators.oneOf({
          matchValues: this.allowedKinds,
          message: 'نوع المصروف غير معتمد',
        }),
      ],
    ],
    amount: [
      null as number | null,
      [
        RxwebValidators.required({ message: 'أدخل المبلغ' }),
        RxwebValidators.numeric({
          allowDecimal: true,
          message: 'أدخل رقمًا صحيحًا (يمكن أن يكون عشريًا)',
        }),
        RxwebValidators.minNumber({
          value: 0.01,
          message: 'الحد الأدنى للمبلغ 0.01',
        }),
      ],
    ],
    spent_at: [
      new Date(),
      [
        RxwebValidators.required({ message: 'اختر تاريخ الصرف' }),
        RxwebValidators.maxDate({
          value: new Date(),
          message: 'لا يمكن اختيار تاريخ في المستقبل',
        }),
      ],
    ],
    description: [
      '',
      [
        RxwebValidators.maxLength({
          value: 300,
          message: 'الحد الأقصى للوصف 300 حرف',
        }),
      ],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private toast: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadExpenses(0, this.rows);
  }

  onSearchInput(ev: Event) {
    const v = (ev.target as HTMLInputElement).value ?? '';
    this.q.set(v);
  }
  onDateSelect(date: Date) {
    const current = this.dateRange() ?? [];
    if (current.length === 0) this.dateRange.set([date]);
    else if (current.length === 1)
      this.dateRange.set([current[0], date].sort((a, b) => +a - +b));
    else this.dateRange.set([date]);
  }
  onDateClear() {
    this.dateRange.set(null);
  }

  async onSearch() {
    await this.loadExpenses(0, this.rows);
  }
  async onClearFilters() {
    this.q.set('');
    this.dateRange.set(null);
    await this.loadExpenses(0, this.rows);
  }

  async onLazy(event: any) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows;
    this.sortField = event.sortField || 'spent_at';
    this.sortOrder = event.sortOrder === 1 ? 1 : -1;
    await this.loadExpenses(first, rows);
  }

  newExpense() {
    this.editingId = null;
    this.formExpense.reset({
      kind: '',
      amount: null,
      spent_at: new Date(),
      description: '',
    });
    this.showEditor = true;
  }

  editExpense(row: Expense) {
    this.editingId = row.id;
    this.formExpense.reset({
      kind: row.kind,
      amount: row.amount,
      spent_at: new Date(row.spent_at),
      description: row.description || '',
    });
    this.showEditor = true;
  }

  async saveExpense() {
    if (this.formExpense.invalid) {
      Object.values(this.formExpense.controls).forEach((c) =>
        c.markAsTouched()
      );
      this.toast.add({
        severity: 'warn',
        summary: 'تحقق من الحقول',
        detail: 'أكمل البيانات المطلوبة.',
      });
      return;
    }

    const v = this.formExpense.value;
    const payload = {
      kind: v.kind!,
      amount: Number(v.amount),
      spent_at: new Date(v.spent_at as Date).toISOString().slice(0, 10),
      description: v.description || null,
    };

    this.loading = true;
    try {
      if (this.editingId) {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', this.editingId);
        if (error) throw error;
        this.toast.add({
          severity: 'success',
          summary: 'تم التحديث',
          detail: 'تم تعديل المصروف بنجاح.',
        });
      } else {
        const { error } = await supabase.from('expenses').insert([payload]);
        if (error) throw error;
        this.toast.add({
          severity: 'success',
          summary: 'تم الحفظ',
          detail: 'تم إضافة المصروف بنجاح.',
        });
      }
      this.showEditor = false;
      await this.loadExpenses(0, this.rows);
    } catch (e: any) {
      this.toast.add({
        severity: 'error',
        summary: 'خطأ',
        detail: e?.message || 'تعذر حفظ البيانات',
      });
    } finally {
      this.loading = false;
    }
  }

  deleteExpense(row: Expense) {
    this.confirm.confirm({
      message: 'هل أنت متأكد من حذف هذا المصروف نهائيًا؟ لا يمكن التراجع.',
      header: 'تأكيد الحذف النهائي',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', row.id);
          if (error) throw error;
          this.toast.add({
            severity: 'success',
            summary: 'تم الحذف النهائي',
            detail: 'تم حذف المصروف بنجاح.',
          });
          await this.loadExpenses(0, this.rows);
        } catch (e: any) {
          this.toast.add({
            severity: 'error',
            summary: 'خطأ',
            detail: e?.message || 'تعذر حذف المصروف',
          });
        }
      },
    });
  }

  async loadExpenses(first: number, rows: number) {
    this.loading = true;
    try {
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .order(this.sortField, { ascending: this.sortOrder === 1 });

      const s = this.q().trim();
      if (s) query = query.or(`kind.ilike.%${s}%,description.ilike.%${s}%`);

      const dr = this.dateRange();
      if (dr?.[0]) {
        const from = new Date(dr[0]);
        from.setHours(0, 0, 0, 0);
        query = query.gte('spent_at', from.toISOString().slice(0, 10));
      }
      if (dr?.[1]) {
        const to = new Date(dr[1]);
        to.setHours(23, 59, 59, 999);
        query = query.lte('spent_at', to.toISOString().slice(0, 10));
      }

      const { data, error, count } = await query.range(first, first + rows - 1);
      if (error) throw error;

      this.data = (data || []) as Expense[];
      this.totalRecords = count || 0;
      this.rows = rows;

      await this.computeMonthTotal();
    } catch (e: any) {
      this.toast.add({
        severity: 'error',
        summary: 'خطأ',
        detail: e?.message || 'تعذر جلب البيانات',
      });
    } finally {
      this.loading = false;
    }
  }

  private async computeMonthTotal() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('spent_at', start.toISOString().slice(0, 10))
      .lte('spent_at', end.toISOString().slice(0, 10));

    if (!error && data) {
      const sum = (data as { amount: number }[]).reduce(
        (t, r) => t + Number(r.amount || 0),
        0
      );
      this.monthTotal.set(Number(sum.toFixed(2)));
    } else {
      this.monthTotal.set(0);
    }
  }

  fmtDate(d: string) {
    return new Date(d).toLocaleDateString('ar-EG', { dateStyle: 'medium' });
  }

  getKindLabel(kindValue: string): string {
    const kind = this.kinds.find((k) => k.value === kindValue);
    return kind ? kind.label : kindValue;
  }
}
