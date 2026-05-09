import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { of, take } from 'rxjs';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, SelectItem } from 'primeng/api';

import { TeacherService } from '../../../../../core/services/teacher.service';
import {
  SubjectDetail,
  TeacherInsert,
  TeacherRecord,
} from '../../../../../core/models/teacher.model';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { NotificationService } from '../../../../../core/services/notification.service';

const JOB_OTHER = '__OTHER__';
const UNIV_OTHER = '__OTHER__';

@Component({
  selector: 'app-teachers-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DividerModule,
    DropdownModule,
    ValidationMessagePage,
  ],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.scss',
})
export class TeachersComponent implements OnInit {
  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly teacherService = inject(TeacherService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly jobTitleOtherValue = JOB_OTHER;
  readonly universityOtherValue = UNIV_OTHER;

  readonly jobTitleOptions: SelectItem[] = [
    { label: 'مدرس رياضيات', value: 'مدرس رياضيات' },
    { label: 'مدرس علوم', value: 'مدرس علوم' },
    { label: 'مدرس لغة عربية', value: 'مدرس لغة عربية' },
    { label: 'مدرس لغة إنجليزية', value: 'مدرس لغة إنجليزية' },
    { label: 'مدرس دراسات اجتماعية', value: 'مدرس دراسات اجتماعية' },
    { label: 'مدرس تربية دينية / علوم شرعية', value: 'مدرس تربية دينية / علوم شرعية' },
    { label: 'مدرس فيزياء', value: 'مدرس فيزياء' },
    { label: 'أخصائي صعوبات تعلم', value: 'أخصائي صعوبات تعلم' },
    { label: 'مدرس مساعد', value: 'مدرس مساعد' },
    {
      label: 'مدرس دراسات + أخصائي صعوبات',
      value: 'مدرس دراسات اجتماعية — أخصائي صعوبات تعلم',
    },
    { label: 'أخرى (إدخال يدوي)', value: JOB_OTHER },
  ];

  readonly universityOptions: SelectItem[] = [
    { label: '— بدون —', value: '' },
    { label: 'جامعة الأقصر', value: 'جامعة الأقصر' },
    { label: 'جامعة الأزهر', value: 'جامعة الأزهر' },
    { label: 'جامعة جنوب الوادي — قنا', value: 'جامعة جنوب الوادي بقنا' },
    { label: 'جامعة القاهرة', value: 'جامعة القاهرة' },
    { label: 'جامعة عين شمس', value: 'جامعة عين شمس' },
    { label: 'جامعة المنصورة', value: 'جامعة المنصورة' },
    { label: 'أخرى (إدخال يدوي)', value: UNIV_OTHER },
  ];

  teachers: TeacherRecord[] = [];
  globalFilterValue = '';
  isEditing = false;
  editingTeacherId: number | null = null;

  teacherForm!: FormGroup;

  /** ملف جديد قبل الرفع */
  pendingImageFile: File | null = null;
  /** معاينة محلية قبل الحفظ */
  imageBlobUrl: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.wireDropdownValidators();
    this.loadTeachers();
  }

  private wireDropdownValidators(): void {
    this.teacherForm.get('job_title_option')?.valueChanges.subscribe((v) => {
      const custom = this.teacherForm.get('job_title_custom');
      if (v === JOB_OTHER) {
        custom?.setValidators([Validators.required]);
      } else {
        custom?.clearValidators();
        custom?.setValue(null, { emitEvent: false });
      }
      custom?.updateValueAndValidity({ emitEvent: false });
    });

    this.teacherForm.get('university_option')?.valueChanges.subscribe((v) => {
      const custom = this.teacherForm.get('university_custom');
      if (v === UNIV_OTHER) {
        custom?.clearValidators();
      } else {
        custom?.clearValidators();
        custom?.setValue(null, { emitEvent: false });
      }
      custom?.updateValueAndValidity({ emitEvent: false });
    });
  }

  initForm(): void {
    this.teacherForm = this.fb.group({
      full_name: [null as string | null, RxwebValidators.required()],
      phone: [null as string | null],
      job_title_option: [null as string | null, RxwebValidators.required()],
      job_title_custom: [null as string | null],
      experience: [0, [Validators.min(0)]],
      university_option: ['' as string],
      university_custom: [null as string | null],
      image: [null as string | null],
      description: [null as string | null],
      notes: [null as string | null],
      subjects: this.fb.array<FormGroup>([this.buildSubjectGroup()]),
    });
  }

  get subjects(): FormArray {
    return this.teacherForm.get('subjects') as FormArray;
  }

  private buildSubjectGroup(s?: SubjectDetail): FormGroup {
    return this.fb.group({
      name: [s?.name ?? '', RxwebValidators.required()],
      teaching_scope: [
        s?.teaching_scope ?? '',
        RxwebValidators.required(),
      ],
    });
  }

  addSubjectRow(s?: SubjectDetail): void {
    this.subjects.push(this.buildSubjectGroup(s));
  }

  removeSubjectRow(index: number): void {
    if (this.subjects.length <= 1) {
      this.notificationService.showWarning(
        'يجب الإبقاء على صف مادة واحد على الأقل؛ يمكنك ترك الحقول فارغة مؤقتًا ثم التعديل.'
      );
      return;
    }
    this.subjects.removeAt(index);
  }

  loadTeachers(): void {
    this.teacherService
      .getAllTeacherRecords()
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          this.teachers = rows;
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showError(
            'تعذّر تحميل قائمة المعلمين.',
            'خطأ في الاتصال'
          );
        },
      });
  }

  onPhotoChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.notificationService.showWarning(
        'اختر صورة بصيغة JPG أو PNG أو WEBP أو GIF.'
      );
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.notificationService.showWarning(
        'حجم الصورة يجب ألا يتجاوز 2 ميجابايت.'
      );
      input.value = '';
      return;
    }

    this.pendingImageFile = file;
    if (this.imageBlobUrl) {
      URL.revokeObjectURL(this.imageBlobUrl);
    }
    this.imageBlobUrl = URL.createObjectURL(file);
  }

  clearPhoto(): void {
    this.pendingImageFile = null;
    if (this.imageBlobUrl) {
      URL.revokeObjectURL(this.imageBlobUrl);
      this.imageBlobUrl = null;
    }
    this.teacherForm.patchValue({ image: null });
    if (this.photoInput?.nativeElement) {
      this.photoInput.nativeElement.value = '';
    }
  }

  private clearPhotoPreviewOnly(): void {
    this.pendingImageFile = null;
    if (this.imageBlobUrl) {
      URL.revokeObjectURL(this.imageBlobUrl);
      this.imageBlobUrl = null;
    }
    if (this.photoInput?.nativeElement) {
      this.photoInput.nativeElement.value = '';
    }
  }

  /** للعرض في وسم img */
  get displayImageSrc(): string | null {
    if (this.imageBlobUrl) {
      return this.imageBlobUrl;
    }
    const raw = this.teacherForm?.get('image')?.value as string | null;
    return this.normalizeImageSrc(raw);
  }

  private normalizeImageSrc(raw: string | null | undefined): string | null {
    if (!raw?.trim()) {
      return null;
    }
    const u = raw.trim();
    if (u.startsWith('http://') || u.startsWith('https://')) {
      return u;
    }
    const idx = u.indexOf('assets/');
    if (idx >= 0) {
      return '/' + u.slice(idx).replace(/^\/+/, '');
    }
    if (u.startsWith('/')) {
      return u;
    }
    return '/' + u.replace(/^\/+/, '');
  }

  private resolveJobTitle(): string | null {
    const opt = this.teacherForm.get('job_title_option')?.value as string | null;
    if (opt === JOB_OTHER) {
      const t = (this.teacherForm.get('job_title_custom')?.value ?? '').trim();
      return t || null;
    }
    return (opt ?? '').trim() || null;
  }

  private resolveUniversity(): string | null {
    const opt = this.teacherForm.get('university_option')?.value as
      | string
      | null
      | undefined;
    if (opt == null || opt === '') {
      return null;
    }
    if (opt === UNIV_OTHER) {
      const t = (this.teacherForm.get('university_custom')?.value ?? '').trim();
      return t || null;
    }
    return String(opt).trim();
  }

  private patchJobTitle(stored: string | null): void {
    const t = (stored ?? '').trim();
    if (!t) {
      this.teacherForm.patchValue({
        job_title_option: null,
        job_title_custom: null,
      });
      return;
    }
    const known = this.jobTitleOptions.find(
      (o) =>
        o.value !== JOB_OTHER &&
        typeof o.value === 'string' &&
        o.value.trim() === t
    );
    if (known) {
      this.teacherForm.patchValue({
        job_title_option: known.value,
        job_title_custom: null,
      });
      return;
    }
    this.teacherForm.patchValue({
      job_title_option: JOB_OTHER,
      job_title_custom: t,
    });
  }

  private patchUniversity(stored: string | null): void {
    const t = (stored ?? '').trim();
    if (!t) {
      this.teacherForm.patchValue({
        university_option: '',
        university_custom: null,
      });
      return;
    }
    const known = this.universityOptions.find(
      (o) =>
        o.value !== '' &&
        o.value !== UNIV_OTHER &&
        typeof o.value === 'string' &&
        o.value.trim() === t
    );
    if (known) {
      this.teacherForm.patchValue({
        university_option: known.value,
        university_custom: null,
      });
      return;
    }
    this.teacherForm.patchValue({
      university_option: UNIV_OTHER,
      university_custom: t,
    });
  }

  private collectSubjectsFromForm(): SubjectDetail[] {
    return this.subjects.controls.map((c) => {
      const v = (c as FormGroup).value as {
        name: string;
        teaching_scope: string;
      };
      return {
        name: (v.name ?? '').trim(),
        teaching_scope: (v.teaching_scope ?? '').trim(),
      };
    });
  }

  private buildInsertPayload(): TeacherInsert {
    const v = this.teacherForm.value as {
      full_name: string;
      phone: string | null;
      experience: number;
      image: string | null;
      description: string | null;
      notes: string | null;
    };

    return {
      full_name: v.full_name.trim(),
      phone: v.phone?.trim() || null,
      job_title: this.resolveJobTitle(),
      subjects: this.collectSubjectsFromForm(),
      experience: Math.max(0, Number(v.experience ?? 0)),
      university: this.resolveUniversity(),
      image: v.image?.trim() || null,
      description: v.description?.trim() || null,
      notes: v.notes?.trim() || null,
    };
  }

  private runSave(uploadedImageUrl: string | null): void {
    const payload = this.buildInsertPayload();
    if (uploadedImageUrl) {
      payload.image = uploadedImageUrl;
    }

    const done = () => {
      this.clearPhotoPreviewOnly();
      this.loadTeachers();
      this.resetFormState(true);
    };

    if (this.isEditing && this.editingTeacherId != null) {
      this.teacherService
        .updateTeacher(this.editingTeacherId, payload)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.notificationService.showUpdateSuccess('بيانات المعلم');
            done();
          },
          error: (err) => {
            console.error(err);
            const msg =
              err?.message ||
              'تعذّر حفظ التعديل. تحقق من الاتصال أو من تفعيل مساحة التخزين للصور.';
            this.notificationService.showError(msg, 'خطأ في الاتصال');
          },
        });
      return;
    }

    this.teacherService
      .insertTeacher(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.showAddSuccess('المعلم');
          done();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showError(
            err?.message || 'تعذّر إضافة المعلم.',
            'خطأ في الاتصال'
          );
        },
      });
  }

  saveTeacher(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      this.notificationService.showWarning('الرجاء إكمال الحقول المطلوبة.');
      return;
    }

    const subjects = this.collectSubjectsFromForm();
    const hasEmptyPair = subjects.some(
      (s) => !s.name.length || !s.teaching_scope.length
    );
    if (hasEmptyPair) {
      this.notificationService.showWarning(
        'أكمل اسم المادة ونطاق التدريس لكل الصفوف، أو احذف الصف الفارغ.'
      );
      return;
    }

    const opt = this.teacherForm.get('job_title_option')?.value;
    if (opt === JOB_OTHER) {
      const c = (this.teacherForm.get('job_title_custom')?.value ?? '').trim();
      if (!c) {
        this.notificationService.showWarning(
          'أدخل المسمّى الوظيفي في حقل «مخصّص».'
        );
        return;
      }
    }

    const upload$ = this.pendingImageFile
      ? this.teacherService.uploadTeacherPortrait(this.pendingImageFile, {
          teacherId: this.editingTeacherId ?? undefined,
        })
      : of<string | null>(null);

    upload$.pipe(take(1)).subscribe({
        next: (uploadedUrl) => {
          this.runSave(uploadedUrl);
        },
        error: (err: Error) => {
          console.error(err);
          this.notificationService.showError(
            err?.message ||
              'فشل رفع الصورة. تأكد من تسجيل الدخول وتطبيق سياسات التخزين على Supabase.',
            'رفع الصورة'
          );
        },
      });
  }

  editTeacher(row: TeacherRecord): void {
    this.isEditing = true;
    this.editingTeacherId = row.teacher_id;
    this.clearPhotoPreviewOnly();

    while (this.subjects.length) {
      this.subjects.removeAt(0);
    }
    const list = row.subjects?.length
      ? row.subjects
      : [{ name: '', teaching_scope: '' }];
    for (const s of list) {
      this.subjects.push(this.buildSubjectGroup(s));
    }

    this.patchJobTitle(row.job_title);
    this.patchUniversity(row.university);

    this.teacherForm.patchValue({
      full_name: row.full_name,
      phone: row.phone,
      experience: row.experience,
      image: row.image,
      description: row.description,
      notes: row.notes,
    });
  }

  resetFormState(resetAll = true): void {
    while (this.subjects.length) {
      this.subjects.removeAt(0);
    }
    this.subjects.push(this.buildSubjectGroup());

    this.clearPhotoPreviewOnly();

    this.teacherForm.reset(
      {
        full_name: null,
        phone: null,
        job_title_option: null,
        job_title_custom: null,
        experience: 0,
        university_option: '',
        university_custom: null,
        image: null,
        description: null,
        notes: null,
      },
      { emitEvent: false }
    );

    if (resetAll) {
      this.isEditing = false;
      this.editingTeacherId = null;
    }
  }

  cancelEdit(): void {
    this.resetFormState(true);
    this.notificationService.showCancelSuccess('عملية التعديل');
  }

  deleteTeacher(row: TeacherRecord): void {
    this.confirmationService.confirm({
      message:
        'هل أنت متأكد من حذف هذا المعلم؟ إذا كانت له حصص أو مدفوعات مرتبطة قد يمنع الخادم الحذف.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.teacherService
          .deleteTeacher(row.teacher_id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.notificationService.showDeleteSuccess('المعلم');
              this.loadTeachers();
              if (this.editingTeacherId === row.teacher_id) {
                this.resetFormState(true);
              }
            },
            error: (err) => {
              console.error(err);
              this.notificationService.showError(
                'تعذّر الحذف. قد يكون المعلم مرتبطًا بحصص أو مدفوعات.',
                'خطأ'
              );
            },
          });
      },
      reject: () =>
        this.notificationService.showCancelSuccess('عملية الحذف'),
    });
  }

  subjectsPreview(row: TeacherRecord): string {
    return (row.subjects ?? [])
      .map((s) => s.name)
      .filter(Boolean)
      .join('، ');
  }

  get saveLabel(): string {
    return this.isEditing ? 'حفظ التعديل' : 'إضافة معلم';
  }

  get saveClass(): string {
    return this.isEditing ? 'p-button-warning' : 'p-button-primary';
  }

  get disableSave(): boolean {
    return this.teacherForm.invalid;
  }
}
