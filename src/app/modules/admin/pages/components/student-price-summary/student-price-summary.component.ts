import { PaymentService } from './../../../../../core/services/PaymentService.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Observable,
  of,
  switchMap,
  startWith,
  BehaviorSubject,
  catchError,
  map,
  tap,
  Subscription,
  filter,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { SelectItem, MessageService } from 'primeng/api';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';
import { TagModule } from 'primeng/tag';
import {
  StudentService,
  Subject,
  FilteredStudentResult,
  PaymentStudentFilters,
} from '../../../../../core/services/students.service';
import {
  PaymentInsertUpdate,
  PaymentResult,
} from '../../../../../core/services/PaymentService.service';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../../../core/services/notification.service';

export interface StudentWithPaymentStatus {
  student_id: string;
  full_name: string;
  year_level: number;

  stage: string;

  payment_id: string | null;
  payment_month: Date;
  is_paid: boolean;
  method: string | null;
  notes: string | null;
  paid_at: string | Date | null;

  subscribed_subjects: Subject[];
  total_base_price: number;
  discount_percent: number;
  final_price: number;
}

@Component({
  selector: 'app-student-price-summary',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    CardModule,
    ValidationMessagePage,
    ReactiveFormsModule,
    CheckboxModule,
    CalendarModule,
    InputTextareaModule,
    FormsModule,
    DialogModule,
    TagModule,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './student-price-summary.component.html',
  styleUrl: './student-price-summary.component.scss',
  providers: [MessageService],
})
export class StudentPriceSummaryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private academicDataService = inject(AcademicDataService);
  private studentService = inject(StudentService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);

  filterForm!: FormGroup;
  paymentDialogForm!: FormGroup;

  displayPaymentDialog: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  isSearching: boolean = false;

  currentStudent: StudentWithPaymentStatus | null = null;
  dialogHeader: string = '';

  stages$!: Observable<SelectItem[]>;
  yearLevels$!: Observable<SelectItem[]>;

  private studentsSubject = new BehaviorSubject<StudentWithPaymentStatus[]>([]);
  filteredStudents$: Observable<StudentWithPaymentStatus[] | null> =
    this.studentsSubject.asObservable();

  studentsList: StudentWithPaymentStatus[] = [];

  private subscriptions: Subscription = new Subscription();

  paymentMethods: SelectItem[] = [
    { label: 'كاش (نقدي)', value: 'كاش (نقدي)' },
    { label: 'تحويل بنكي', value: 'تحويل بنكي' },
    { label: 'فودافون كاش', value: 'فودافون كاش' },
    { label: 'بطاقة ائتمان', value: 'بطاقة ائتمان' },
    { label: 'انستا باي', value: 'انستا باي' },
  ];

  paymentStatusOptions: SelectItem[] = [
    { label: 'كل الطلاب', value: 'all' },
    { label: 'الطلاب المدفوعون', value: 'paid' },
    { label: 'الطلاب غير المدفوعين', value: 'unpaid' },
  ];

  currentPaymentDate = new Date();

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.initPaymentDialogForm();
    this.stages$ = this.academicDataService.stages$;
    this.setupAcademicFiltering();

    this.subscriptions.add(
      this.filteredStudents$
        .pipe(filter((list) => list !== null))
        .subscribe((list) => {
          this.studentsList = list as StudentWithPaymentStatus[];
        })
    );
  }

  initPaymentDialogForm(): void {
    this.paymentDialogForm = this.fb.group({
      selectedStudentId: [null as string | null, null],
      is_paid: [false, Validators.required],
      method: [null as string | null, null],
      paid_at: [null as Date | null, null],
      notes: [null as string | null],
    });

    this.paymentDialogForm
      .get('selectedStudentId')
      ?.valueChanges.subscribe((selectedId: string | null) => {
        if (!this.isEditMode && selectedId) {
          const studentData = this.studentsList.find(
            (s) => s.student_id === selectedId
          );
          this.currentStudent = studentData || null;

          if (this.currentStudent) {
            this.paymentDialogForm.patchValue({
              is_paid: true,
              paid_at: new Date(),
            });
          }
        } else if (!selectedId && !this.isEditMode) {
          this.currentStudent = null;
        }
      });

    this.paymentDialogForm.get('is_paid')?.valueChanges.subscribe((paid) => {
      const methodControl = this.paymentDialogForm.get('method');
      const paidAtControl = this.paymentDialogForm.get('paid_at');

      if (paid) {
        methodControl?.setValidators(Validators.required);
        paidAtControl?.setValidators(Validators.required);
        if (!paidAtControl?.value) {
          paidAtControl?.setValue(new Date());
        }
      } else {
        methodControl?.clearValidators();
        paidAtControl?.clearValidators();
        methodControl?.setValue(null);
        paidAtControl?.setValue(null);
      }
      methodControl?.updateValueAndValidity();
      paidAtControl?.updateValueAndValidity();
    });
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      stage: [null as string | null, Validators.required],
      yearLevel: [null as number | null, Validators.required],
      paymentStatus: ['all' as 'all' | 'paid' | 'unpaid'],
      paymentMonth: [this.currentPaymentDate, Validators.required],
    });
  }

  setupAcademicFiltering(): void {
    const stageControl = this.filterForm.get('stage');
    const yearLevelControl = this.filterForm.get('yearLevel');

    if (stageControl && yearLevelControl) {
      this.yearLevels$ = stageControl.valueChanges.pipe(
        startWith(stageControl.value),
        switchMap((selectedStage: string | null) => {
          if (!selectedStage) {
            return of([]);
          }
          yearLevelControl.setValue(null, { emitEvent: false });
          return this.academicDataService.getYearLevels(selectedStage);
        })
      );

      stageControl.valueChanges.subscribe(() => {
        this.studentsSubject.next([]);
      });

      yearLevelControl.valueChanges.subscribe(() => {
        this.studentsSubject.next([]);
      });
    } else {
      this.yearLevels$ = of([]);
    }
  }

  searchStudents(): void {
    const filters = this.filterForm.value;

    if (!filters.yearLevel || !filters.paymentMonth) {
      this.notificationService.showWarning('الرجاء تحديد المرحلة والصف.');
      this.studentsSubject.next([]);
      return;
    }

    const selectedMonthYear = filters.paymentMonth
      ? `${filters.paymentMonth.getFullYear()}-${String(
          filters.paymentMonth.getMonth() + 1
        ).padStart(2, '0')}-01`
      : null;

    if (!selectedMonthYear) return;

    this.isSearching = true;

    const studentFilters: Partial<PaymentStudentFilters> = {
      stage: filters.stage,
      yearLevel: filters.yearLevel,
      paymentMonth: selectedMonthYear,
      paymentStatus: filters.paymentStatus,
    };

    this.studentService
      .getStudentsWithPaymentSummary(studentFilters as PaymentStudentFilters)
      .pipe(
        catchError((err) => {
          console.error('Fetch Students Error:', err);

          this.notificationService.showError('فشل جلب قائمة الطلاب.');
          this.isSearching = false;
          return of(null);
        }),
        map((results: FilteredStudentResult[] | null) => {
          this.isSearching = false;
          if (!results) return [];

          const currentMonth = new Date(selectedMonthYear!);

          return results.map((student) => ({
            ...student,
            payment_month: currentMonth,
            paid_at: student.paid_at ? new Date(student.paid_at) : null,
          })) as StudentWithPaymentStatus[];
        }),
        tap((results) => this.studentsSubject.next(results))
      )
      .subscribe();
  }

  isDataEmpty(): boolean {
    return this.studentsList.length === 0 && !this.isSearching;
  }

  openNewPaymentDialog(): void {
    if (this.studentsList.length === 0) {
      this.notificationService.showWarning('الرجاء إجراء بحث عن الطلاب أولاً.');
      return;
    }

    const unpaidStudents = this.studentsList.filter((s) => !s.is_paid);

    if (unpaidStudents.length === 0) {
      this.notificationService.showInfo(
        'جميع الطلاب في القائمة مدفوعون بالفعل.'
      );
      return;
    }

    this.currentStudent = null;
    this.isEditMode = false;
    this.dialogHeader = 'تسجيل دفعة جديدة';
    this.displayPaymentDialog = true;

    setTimeout(() => {
      this.paymentDialogForm.reset({
        selectedStudentId: null,
        is_paid: true,
        method: null,
        paid_at: new Date(),
        notes: null,
      });

      this.paymentDialogForm
        .get('selectedStudentId')
        ?.setValidators(Validators.required);
      this.paymentDialogForm.get('selectedStudentId')?.updateValueAndValidity();

      this.paymentDialogForm.get('method')?.clearValidators();
      this.paymentDialogForm.get('paid_at')?.clearValidators();
      this.paymentDialogForm.get('method')?.updateValueAndValidity();
      this.paymentDialogForm.get('paid_at')?.updateValueAndValidity();
    }, 0);
  }

  openPaymentDialog(
    student: StudentWithPaymentStatus,
    isEdit: boolean = true
  ): void {
    this.currentStudent = student;
    this.isEditMode = isEdit;

    this.dialogHeader = `${student.is_paid ? 'تعديل' : 'تسجيل'} دفعة الطالب: ${
      student.full_name
    }`;
    this.displayPaymentDialog = true;

    setTimeout(() => {
      this.paymentDialogForm.reset({
        selectedStudentId: null,
        is_paid: student.is_paid || false,
        method: student.method || null,
        paid_at: student.paid_at ? new Date(student.paid_at) : new Date(),
        notes: student.notes || null,
      });

      this.paymentDialogForm.get('selectedStudentId')?.clearValidators();
      this.paymentDialogForm.get('selectedStudentId')?.updateValueAndValidity();
    }, 0);
  }

  savePayment(): void {
    const fDialog = this.paymentDialogForm.controls;

    if (!this.isEditMode && fDialog['selectedStudentId'].invalid) {
      this.paymentDialogForm.markAllAsTouched();

      this.notificationService.showInfo('الرجاء اختيار الطالب لتسجيل الدفعة.');
      return;
    }

    if (fDialog['is_paid'].value && this.paymentDialogForm.invalid) {
      this.paymentDialogForm.markAllAsTouched();

      this.notificationService.showInfo('الرجاء ملء جميع حقول الدفع المطلوبة.');
      return;
    }

    if (!this.currentStudent) {
      this.notificationService.showError(
        'خطأ داخلي: لم يتم تحديد بيانات الطالب.'
      );
      return;
    }

    this.isSaving = true;

    const student = this.currentStudent;
    const formValue = this.paymentDialogForm.value;

    const paymentMonthDate = new Date(student.payment_month);

    const utcFirstDayOfMonth = new Date(
      Date.UTC(paymentMonthDate.getFullYear(), paymentMonthDate.getMonth(), 1)
    );

    const paymentsData: PaymentInsertUpdate[] = student.subscribed_subjects.map(
      (subject) => {
        const finalPricePerSubject =
          subject.base_price * (1 - student.discount_percent / 100);

        return {
          student_id: student.student_id,

          month_year: utcFirstDayOfMonth.toISOString(),

          subject_id: subject.subject_id,
          base_price: subject.base_price,
          discount_percent: student.discount_percent,
          final_price: finalPricePerSubject,

          is_paid: formValue.is_paid,
          method: formValue.is_paid ? formValue.method : null,
          notes: formValue.notes || null,

          paid_at:
            formValue.is_paid && formValue.paid_at
              ? new Date(formValue.paid_at).toISOString()
              : null,

          payment_id: undefined,
        };
      }
    );

    this.paymentService
      .savePayment(paymentsData)
      .pipe(
        catchError((err) => {
          this.notificationService.showError('  فشل حفظ الدفعات.');
          this.isSaving = false;
          return of(null);
        }),
        tap((res: PaymentResult[] | null) => {
          this.isSaving = false;
          if (res && res.length > 0) {
            if (this.isEditMode) {
              this.notificationService.showSuccess(
                'تم تعديل دفعة الطالب بنجاح.'
              );
            } else {
              this.notificationService.showSuccess(
                'تم تسجيل دفعة الطالب بنجاح.'
              );
            }

            this.displayPaymentDialog = false;

            this.searchStudents();
          }
        })
      )
      .subscribe();
  }

  updateStudentLocally(
    studentId: string,
    paymentResponse: PaymentResult
  ): void {
    const currentList = this.studentsList;
    const studentIndex = currentList.findIndex(
      (s) => s.student_id === studentId
    );

    if (studentIndex > -1) {
      const currentStudent = currentList[studentIndex];

      const updatedStudent: StudentWithPaymentStatus = {
        ...currentStudent,
        is_paid: paymentResponse.is_paid ?? currentStudent.is_paid,
        paid_at: paymentResponse.paid_at
          ? new Date(paymentResponse.paid_at)
          : currentStudent.paid_at ?? null,
        method: paymentResponse.method ?? currentStudent.method,
        notes: paymentResponse.notes ?? currentStudent.notes,
        payment_id: paymentResponse.payment_id ?? currentStudent.payment_id,
      };

      currentList[studentIndex] = updatedStudent;

      this.studentsList = [...currentList];
      this.studentsSubject.next(this.studentsList);
    }
  }

  clearSearch(): void {
    this.filterForm.reset({
      stage: null,
      yearLevel: null,
      paymentStatus: 'all',
      paymentMonth: this.currentPaymentDate,
    });

    this.studentsSubject.next([]);
    this.yearLevels$ = of([]);

    this.isSearching = false;
  }

  formatPaymentDate(date: string | Date | null): string {
    if (!date) return '-';
    const dateObject = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObject.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return dateObject.toLocaleDateString('ar-EG', options);
  }

  get f() {
    return this.filterForm.controls;
  }
  get fDialog() {
    return this.paymentDialogForm.controls;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  get unpaidStudentsOptions(): StudentWithPaymentStatus[] {
    return this.studentsList.filter((s) => !s.is_paid);
  }
}
