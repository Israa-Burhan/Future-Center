import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TeacherService } from '../../../../../core/services/teacher.service';
import { TeacherPaymentService } from '../../../../../core/services/TeacherPaymentService.service';
import { Teacher } from '../../../../../core/models/teacher.model';
import {
  TeacherPayment,
  PaymentInsertUpdate,
} from '../../../../../core/models/teacher.model';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../../../core/services/notification.service';

interface TeacherPaymentSummary extends Teacher {
  current_payment?: TeacherPayment | null;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InputNumberModule,
    DialogModule,
    CalendarModule,
    TableModule,
    TagModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    ToastModule,
    ValidationMessagePage,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
  providers: [MessageService],
})
export class PaymentsComponent implements OnInit {
  allTeachers: Teacher[] = [];
  paymentSummary: TeacherPaymentSummary[] = [];
  teacherSearchTerm: string = '';
  filteredSummary: TeacherPaymentSummary[] = [];

  selectedMonth: Date = new Date();
  isLoading: boolean = false;

  displayPaymentDialog: boolean = false;
  selectedTeacherForPayment: TeacherPaymentSummary | null = null;
  paymentForm!: FormGroup;

  availableTeachersForNewPayment: Teacher[] = [];

  selectedTeacherIdForGeneralForm: number | null = null;

  constructor(
    private teacherService: TeacherService,
    private paymentService: TeacherPaymentService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.teacherService.getAllTeachers().subscribe((teachers) => {
      this.allTeachers = teachers;
      this.searchPayments();
    });
  }

  searchPayments(): void {
    if (
      this.isLoading ||
      !this.selectedMonth ||
      this.allTeachers.length === 0
    ) {
      return;
    }
    this.isLoading = true;
    const monthDate = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth(),
      1
    );
    const monthISO = monthDate.toISOString().substring(0, 10);

    this.paymentService.getPaymentsByMonth(monthISO).subscribe({
      next: (payments: TeacherPayment[]) => {
        this.paymentSummary = this.allTeachers.map((teacher) => {
          const paymentRecord = payments.find(
            (p) => p.teacher_id === teacher.id
          );
          return {
            ...teacher,
            current_payment: paymentRecord || null,
          } as TeacherPaymentSummary;
        });
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching teacher payments:', err);
        this.isLoading = false;

        this.notificationService.showError(
          'فشل التحميل',
          'حدث خطأ في جلب سجلات الدفع.'
        );
      },
    });
  }

  applyFilter(): void {
    if (!this.teacherSearchTerm) {
      this.filteredSummary = [...this.paymentSummary];
    } else {
      const lowerCaseTerm = this.teacherSearchTerm.toLowerCase();
      this.filteredSummary = this.paymentSummary.filter(
        (summary) =>
          summary.name.toLowerCase().includes(lowerCaseTerm) ||
          summary.title.toLowerCase().includes(lowerCaseTerm)
      );
    }
  }

  private initPaymentForm(data?: TeacherPayment): void {
    this.paymentForm = this.fb.group({
      payment_id: [data?.payment_id || null],

      teacher_id_select: [this.selectedTeacherIdForGeneralForm || null],

      base_wage: [data?.base_wage, [Validators.required, Validators.min(0)]],
      bonuses: [data?.bonuses || 0, [Validators.min(0)]],
      deductions: [data?.deductions || 0, [Validators.min(0)]],
      notes: [data?.notes || ''],
      is_paid: [data?.is_paid || false],
      paid_at: [data?.paid_at ? new Date(data.paid_at) : null],
    });

    if (!data) {
      this.paymentForm
        .get('teacher_id_select')
        ?.setValidators(Validators.required);
    }
  }

  openGeneralPaymentDialog(): void {
    const paidOrRecordedTeacherIds = this.paymentSummary
      .filter((summary) => summary.current_payment)
      .map((summary) => summary.id);

    this.availableTeachersForNewPayment = this.allTeachers.filter(
      (teacher) => !paidOrRecordedTeacherIds.includes(teacher.id)
    );

    if (this.availableTeachersForNewPayment.length === 0) {
      this.notificationService.showWarning(
        'تنبيه',
        'تم تسجيل دفعات لجميع المعلمين في هذا الشهر.'
      );
      return;
    }

    this.selectedTeacherForPayment = null;
    this.selectedTeacherIdForGeneralForm = null;
    this.initPaymentForm(undefined);
    this.displayPaymentDialog = true;
  }

  openPaymentDialog(teacherId: number): void {
    const teacherToEdit = this.paymentSummary.find((t) => t.id === teacherId);

    if (teacherToEdit) {
      this.selectedTeacherForPayment = teacherToEdit;
      this.selectedTeacherIdForGeneralForm = null;
      this.initPaymentForm(teacherToEdit.current_payment || undefined);
      this.displayPaymentDialog = true;
    }
  }

  get finalAmount(): number {
    if (!this.paymentForm) return 0;

    const wage = this.paymentForm.get('base_wage')?.value || 0;
    const bonuses = this.paymentForm.get('bonuses')?.value || 0;
    const deductions = this.paymentForm.get('deductions')?.value || 0;

    return wage + bonuses - deductions;
  }

  private updateSummaryLocally(
    savedPayment: TeacherPayment,
    teacherId: number
  ): void {
    const index = this.paymentSummary.findIndex((t) => t.id === teacherId);

    if (index !== -1) {
      this.paymentSummary[index] = {
        ...this.paymentSummary[index],
        current_payment: savedPayment,
      } as TeacherPaymentSummary;
    }

    this.applyFilter();
  }

  savePayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    let teacherIdToUse: number;

    if (this.selectedTeacherForPayment) {
      teacherIdToUse = this.selectedTeacherForPayment.id;
    } else if (this.paymentForm.get('teacher_id_select')?.value) {
      teacherIdToUse = this.paymentForm.get('teacher_id_select')?.value;
    } else {
      console.error('Teacher ID not found for saving.');
      this.isLoading = false;

      this.notificationService.showError('خطأ', 'يرجى اختيار المعلم.');
      return;
    }

    let paymentData: PaymentInsertUpdate = {
      ...this.paymentForm.value,
      teacher_id: teacherIdToUse,

      month_year: new Date(
        this.selectedMonth.getFullYear(),
        this.selectedMonth.getMonth(),
        1
      )
        .toISOString()
        .substring(0, 10),

      final_amount: this.finalAmount,

      paid_at: this.paymentForm.get('paid_at')?.value
        ? new Date(this.paymentForm.get('paid_at')?.value).toISOString()
        : null,
    };

    if (!paymentData.payment_id) {
      delete paymentData.payment_id;
    }
    delete (paymentData as any).teacher_id_select;

    const isUpdate = !!this.paymentForm.get('payment_id')?.value;
    const operationName = isUpdate ? 'تعديل' : 'تسجيل';
    const successMessage = isUpdate
      ? 'تم تحديث الدفعة بنجاح.'
      : 'تم تسجيل دفعة جديدة بنجاح.';

    this.paymentService.savePayment(paymentData).subscribe({
      next: (savedPayment: TeacherPayment) => {
        this.updateSummaryLocally(savedPayment, teacherIdToUse);

        this.displayPaymentDialog = false;
        this.isLoading = false;

        this.notificationService.showSuccess('نجاح', successMessage);
      },
      error: (err) => {
        console.error('Save Payment Error:', err);
        this.isLoading = false;

        let errorDetail =
          'حدث خطأ أثناء حفظ الدفعة. يرجى مراجعة البيانات والمحاولة مرة أخرى.';
        let errorSummary = `فشل ${operationName}`;

        if (
          err.error?.message?.includes('duplicate key value') ||
          err.error?.code === '23505' ||
          err.message?.includes('duplicate key value')
        ) {
          errorSummary = 'تكرار في البيانات';
          errorDetail =
            'لا يمكن تسجيل دفعة جديدة لنفس المعلم في نفس الشهر. يرجى تعديل الدفعة الموجودة.';
        }

        this.notificationService.showError(errorSummary, errorDetail);
      },
    });
  }
  get f() {
    return this.paymentForm.controls;
  }
}
