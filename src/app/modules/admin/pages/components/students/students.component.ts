import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  of,
  switchMap,
  take,
  map,
  startWith,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';

import {
  StudentService,
  StudentInsert,
  Subject,
  Student,
} from '../../../../../core/services/students.service';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';
import { NotificationService } from '../../../../../core/services/notification.service';

interface FeePlanOption {
  name: string;
  discount: number | null;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    DividerModule,
    ValidationMessagePage,
    FormsModule,
    InputNumberModule,
    TooltipModule,
    MultiSelectModule,
    CheckboxModule,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private academicDataService = inject(AcademicDataService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  studentForm!: FormGroup;
  students$!: Observable<Student[]>;
  isEditing: boolean = false;
  editingStudentId: string | null = null;
  stages$!: Observable<SelectItem[]>;
  yearLevels$!: Observable<SelectItem[]>;
  academicYears: string[] = this.generateAcademicYears();
  private subjectsSource = new BehaviorSubject<Subject[]>([]);
  availableSubjects$: Observable<Subject[]> =
    this.subjectsSource.asObservable();
  subjectIdToNameMap: Map<string, string> = new Map();

  feePlans: FeePlanOption[] = [
    { name: 'رسوم كاملة (لا يوجد خصم)', discount: 0 },
    { name: 'إعفاء كامل', discount: 100 },
    { name: 'خصم إخوة', discount: 25 },
    { name: 'اشتراك أكثر من مادة', discount: 30 },
    { name: 'أخرى', discount: null },
  ];

  isDiscountManual: boolean = false;
  isSubmitting: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.stages$ = this.academicDataService.stages$;
    this.initForm();
    this.setupAcademicFiltering();
    this.setupSubjectFiltering();
    this.setupFeePlanLogic();
    this.loadSubjectMapping();
  }

  loadSubjectMapping(): void {
    this.studentService
      .getAllSubjects()
      .pipe(take(1))
      .subscribe({
        next: (subjects: Subject[]) => {
          subjects.forEach((sub: Subject) => {
            this.subjectIdToNameMap.set(sub.subject_id, sub.subject_name);
          });

          this.loadStudents();
        },
        error: (err: any) => {
          this.notificationService.showError('حدث خطأ', err);
          this.loadStudents();
        },
      });
  }

  loadStudents(): void {
    const subjectMap = this.subjectIdToNameMap;

    this.students$ = this.studentService.getAllStudents().pipe(
      map((students: Student[]) => {
        return students.map((student) => {
          const subjectNames = student.subscribed_subjects
            .map((id) => {
              const cleanId = id ? id.trim() : '';
              const name = subjectMap.get(cleanId);
              return name;
            })
            .filter((name): name is string => !!name);

          return {
            ...student,
            subscribed_subject_names: subjectNames,
          } as Student;
        });
      })
    );
  }

  generateAcademicYears(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = -3; i < 6; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}/${endYear}`);
    }
    return years.sort().reverse();
  }

  mustBeDifferent(controlName1: string, controlName2: string) {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const control1 = formGroup.get(controlName1);
      const control2 = formGroup.get(controlName2);
      if (!control1 || !control2) return null;

      const phone1 = String(control1.value || '').replace(/\s/g, '');
      const phone2 = String(control2.value || '').replace(/\s/g, '');
      const currentErrors = control2.errors || {};

      if (phone1 && phone2 && phone1 === phone2) {
        control2.setErrors({
          ...currentErrors,
          mustBeDifferent: true,
        });
        return { mustBeDifferent: true };
      } else {
        if (currentErrors['mustBeDifferent']) {
          const newErrors = { ...currentErrors };
          delete newErrors['mustBeDifferent'];

          if (Object.keys(newErrors).length) {
            control2.setErrors(newErrors);
          } else {
            control2.setErrors(null);
          }
        }
        return null;
      }
    };
  }

  setupAcademicFiltering(): void {
    const gradeControl = this.studentForm.get('grade');
    const yearLevelControl = this.studentForm.get('year_level');

    if (gradeControl && yearLevelControl) {
      this.yearLevels$ = gradeControl.valueChanges.pipe(
        startWith(gradeControl.value),
        switchMap((selectedStage: string | null) => {
          return this.academicDataService.getYearLevels(selectedStage);
        })
      );

      gradeControl.valueChanges.subscribe(() => {
        if (this.isEditing) {
          return;
        }

        yearLevelControl.setValue(null);
        this.studentForm.get('subscribed_subjects')?.setValue([]);
      });
    } else {
      this.yearLevels$ = of([]);
    }
  }

  initForm(): void {
    this.studentForm = this.fb.group(
      {
        full_name: [
          '',
          [
            RxwebValidators.required({ message: 'الاسم مطلوب' }),
            RxwebValidators.minLength({
              value: 3,
              message: 'الحد الادنى للاسم هو 3 احرف',
            }),
          ],
        ],

        phone: [
          '',
          [
            RxwebValidators.pattern({
              expression: { phone: /^0\d{9,11}$/ },
              message: 'رقم الهاتف يجب ان يبدأب ب 0 و يحتوي على 10 ارقام',
            }),
          ],
        ],

        guardian_phone: [
          '',
          [
            RxwebValidators.pattern({
              expression: { phone: /^0\d{9,10}$/ },
              message: 'رقم الهاتف يجب ان يبدأب ب 0 و يحتوي على 10 ارقام',
            }),
          ],
        ],
        grade: [null as string | null, Validators.required],
        year_level: [null as number | null, [Validators.required]],
        subscribed_subjects: [
          [] as any[],
          [
            RxwebValidators.minLength({
              value: 1,
              message: 'الرجاء اختيار مادة واحدة على الأقل.',
            }),
          ],
        ],
        fee_plan: [this.feePlans[0] || '', Validators.required],
        discount_percent: [
          0,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        school_name: [
          '',
          [
            RxwebValidators.required({
              message: 'اسم المدرسة مطلوب',
            }),
            RxwebValidators.minLength({
              value: 3,
              message: 'الحد الادنى للاسم هو 3 احرف',
            }),
          ],
        ],
        academic_year: [this.academicYears[0] || '', Validators.required],
        notes: [''],
      },

      {
        validators: this.mustBeDifferent('phone', 'guardian_phone'),
      }
    );
  }

  setupFeePlanLogic(): void {
    const discountControl = this.studentForm.get('discount_percent');
    discountControl?.disable({ emitEvent: false });
    this.isDiscountManual = false;

    this.studentForm
      .get('fee_plan')
      ?.valueChanges.pipe(
        startWith(
          this.studentForm.get('fee_plan')?.value as FeePlanOption | null
        )
      )
      .subscribe((selectedPlan: FeePlanOption | null) => {
        if (selectedPlan) {
          if (selectedPlan.name === 'أخرى') {
            this.isDiscountManual = true;
            discountControl?.enable({ emitEvent: false });
            discountControl?.setValue(0, { emitEvent: false });
          } else if (selectedPlan.discount !== null) {
            this.isDiscountManual = false;
            discountControl?.setValue(selectedPlan.discount, {
              emitEvent: false,
            });
            discountControl?.disable({ emitEvent: false });
          }
        } else {
          this.isDiscountManual = false;
          discountControl?.setValue(null, { emitEvent: false });
          discountControl?.disable({ emitEvent: false });
        }
        discountControl?.updateValueAndValidity({ emitEvent: false });
      });
  }

  setupSubjectFiltering(): void {
    const yearLevelControl = this.studentForm.get('year_level');

    if (yearLevelControl) {
      yearLevelControl.valueChanges
        .pipe(
          switchMap((yearLevel: number | null) => {
            if (yearLevel) {
              return this.studentService.getSubjectsByYearLevel(yearLevel);
            }
            return of([] as Subject[]);
          })
        )
        .subscribe((subjects) => {
          this.subjectsSource.next(subjects);

          if (this.isEditing) {
            return;
          }

          this.studentForm.get('subscribed_subjects')?.setValue([]);
        });
    }
  }

  saveStudent(): void {
    this.studentForm.get('guardian_phone')?.updateValueAndValidity();
    this.studentForm.get('subscribed_subjects')?.updateValueAndValidity();

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();

      this.notificationService.showWarning(
        'الرجاء إكمال جميع الحقول المطلوبة بشكل صحيح.',
        'تحقق من البيانات'
      );
      return;
    }

    this.isSubmitting = true;
    const formValue = this.studentForm.getRawValue();

    const selectedFeePlan: FeePlanOption | null = formValue.fee_plan;
    const finalFeePlan = selectedFeePlan ? selectedFeePlan.name : null;

    const studentData: StudentInsert = {
      ...formValue,
      fee_plan: finalFeePlan,
      discount_percent: formValue.discount_percent,
    };

    const action$ =
      this.isEditing && this.editingStudentId
        ? this.studentService.updateStudent(this.editingStudentId, studentData)
        : this.studentService.addStudent(studentData);

    const actionName = this.isEditing ? 'الطالب' : 'الطالب الجديد';

    action$.pipe(take(1)).subscribe({
      next: () => {
        if (this.isEditing) {
          this.notificationService.showUpdateSuccess(actionName);
        } else {
          this.notificationService.showAddSuccess(actionName);
        }
        this.loadStudents();
        this.resetFormState(true);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('خطأ في عملية الحفظ/التعديل:', err);
        this.isSubmitting = false;
        this.notificationService.showError(
          `خطاء في عملية الحفظ/التعديل: ${err.message}`,
          'خطأ في الاتصال'
        );
      },
    });
  }

  updateAvailableData(grade: string | null): void {
    if (!grade) {
      this.subjectsSource.next([]);
      this.studentForm.get('year_level')?.setValue(null);
      return;
    }

    this.academicDataService
      .getYearLevels(grade)
      .pipe(take(1))
      .subscribe((levels) => {
        const yearLevelControl = this.studentForm.get('year_level');
        const currentYearLevel = yearLevelControl?.value;

        const isValueValid = levels.some((l) => l.value === currentYearLevel);
        if (currentYearLevel !== null && !isValueValid) {
          yearLevelControl?.setValue(null, { emitEvent: false }); // لا تطلق حدث لإعادة تحميل كل شيء مرتين
        }
      });
  }

  editStudent(student: Student): void {
    if (!student) {
      this.notificationService.showError(
        'تعذر تحديد بيانات الطالب للتعديل.',
        'خطأ في الكائن'
      );
      return;
    }

    this.isEditing = true;
    this.editingStudentId = student.id ?? null;

    const studentData: Student = JSON.parse(JSON.stringify(student)); // Deep Copy!

    console.log('🟢 START: بدأ وضع التعديل (isEditing = true)');
    // 💡 Logging: تأكيد القيمة داخل الدالة
    console.log('   🔗 بيانات الطالب المحملة (الاسم):', studentData.full_name);

    const feePlanObject =
      this.feePlans.find((p) => p.name === studentData.fee_plan) ||
      this.feePlans[0];
    const discountControl = this.studentForm.get('discount_percent');
    const gradeControl = this.studentForm.get('grade');
    const yearLevelControl = this.studentForm.get('year_level'); // 1️⃣ تعيين كافة الحقول الأساسية باستخدام النسخة الجديدة (studentData)

    this.studentForm.patchValue(
      {
        full_name: studentData.full_name || '',
        phone: studentData.phone || '',
        guardian_phone: studentData.guardian_phone || '',
        school_name: studentData.school_name || '',
        academic_year: studentData.academic_year || this.academicYears[0],
        notes: studentData.notes || '',
        fee_plan: feePlanObject,
        discount_percent: studentData.discount_percent ?? 0,
        grade: studentData.grade || null,
      },
      { emitEvent: false }
    );

    gradeControl?.updateValueAndValidity({ emitEvent: true });

    this.studentService
      .getSubjectsByYearLevel(studentData.year_level || null)
      .pipe(take(1))
      .subscribe((subjects) => {
        this.subjectsSource.next(subjects);

        yearLevelControl?.setValue(studentData.year_level || null, {
          emitEvent: false,
        });

        this.studentForm
          .get('subscribed_subjects')
          ?.setValue(
            Array.isArray(studentData.subscribed_subjects)
              ? studentData.subscribed_subjects
              : [],
            { emitEvent: false }
          );
      });
  }

  deleteStudent(student: Student): void {
    const idToDelete = student.id;

    this.confirmationService.confirm({
      message: `هل أنت متأكد تماماً من حذف الطالب  نهائياً؟ سيتم مسح بياناته من قاعدة البيانات.`,
      header: 'تأكيد الحذف النهائي',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',

      accept: () => {
        this.studentService
          .deleteStudent(idToDelete)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.loadStudents();
              this.notificationService.showDeleteSuccess('الطالب');

              if (this.editingStudentId === idToDelete)
                this.resetFormState(true);
            },
            error: (err) => {
              console.error('خطأ في حذف الطالب:', err);
              this.notificationService.showError(
                `خطاء في حذف الطالب: ${err.message}`,
                'خطأ في الاتصال'
              );
            },
          });
      },

      reject: () => {
        this.notificationService.showCancelSuccess('عملية الحذف.');
      },
    });
  }

  resetFormState(resetAll = true): void {
    this.studentForm.reset(
      {
        full_name: '',
        phone: '',
        guardian_phone: '',
        grade: null,
        year_level: null,
        subscribed_subjects: [],
        school_name: '',
        notes: '',
        academic_year: this.academicYears[0],
        fee_plan: this.feePlans[0],
        discount_percent: this.feePlans[0].discount,
      },
      { emitEvent: false }
    );

    this.isDiscountManual = false;
    this.studentForm.get('discount_percent')?.disable({ emitEvent: false });

    if (resetAll) {
      this.isEditing = false;
      this.editingStudentId = null;

      this.subjectsSource.next([]);
    }
  }

  cancelEdit(): void {
    this.resetFormState(true);
    this.notificationService.showCancelSuccess('عملية التعديل. ');
  }

  // get f() {
  //   return this.studentForm.controls;
  // }

  get saveLabel(): string {
    return this.isEditing ? 'حفظ التعديل' : 'إضافة طالب';
  }

  get saveClass(): string {
    return this.isEditing ? 'p-button-warning' : 'p-button-primary';
  }

  get disableSave(): boolean {
    return this.studentForm.invalid;
  }
}
