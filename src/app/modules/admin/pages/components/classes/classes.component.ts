import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';

import { forkJoin } from 'rxjs';

import { TeacherService } from '../../../../../core/services/teacher.service';
import {
  Teacher,
  ClassSchedule,
  SubjectDetail,
} from '../../../../../core/models/teacher.model';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

type ScheduleDTO = {
  id: number | string;
  teacher_id: number;
  subject: string;
  day: string;
  start_time: string;
  class_level_scope?: string;
  class_name?: string | null;
};

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
    ValidationMessagePage,
  ],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ClassesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  scheduleForm = this.fb.group({
    teacherId: [null as number | null, RxwebValidators.required()],
    subjectName: [null as string | null, RxwebValidators.required()],
    educationalLevel: [null as string | null, RxwebValidators.required()],
    subjectScope: [null as string | null, RxwebValidators.required()],
    day: [null as string | null, RxwebValidators.required()],
    startTime: [null as Date | null, RxwebValidators.required()],
    className: [null as string | null],
  });

  teachersList: Teacher[] = [];
  private teachersById = new Map<number, Teacher>();

  availableSubjectsNames: string[] = [];
  availableClassScopes: string[] = [];
  private selectedTeacherFullData: Teacher | undefined;
  private selectedSubjectDetail: SubjectDetail | undefined;

  currentSchedules: ClassSchedule[] = [];
  isEditing = false;
  editingScheduleId: number | null = null;

  daysOfWeek: string[] = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  AllClasses: Record<string, string[]> = {
    ابتدائي: [
      'الصف الأول ابتدائي',
      'الصف الثاني ابتدائي',
      'الصف الثالث ابتدائي',
      'الصف الرابع ابتدائي',
      'الصف الخامس ابتدائي',
      'الصف السادس ابتدائي',
    ],
    إعدادي: ['الصف الأول إعدادي', 'الصف الثاني إعدادي', 'الصف الثالث إعدادي'],
    ثانوي: ['الصف الأول ثانوي', 'الصف الثاني ثانوي', 'الصف الثالث ثانوي'],
  };

  educationalLevels: SelectItem[] = [
    { label: 'ابتدائي', value: 'ابتدائي' },
    { label: 'إعدادي', value: 'إعدادي' },
    { label: 'ثانوي', value: 'ثانوي' },
  ];

  ngOnInit(): void {
    forkJoin({
      teachers: this.teacherService.getAllTeachers(),
      schedules: this.teacherService.getAllSchedules(),
    }).subscribe({
      next: ({ teachers, schedules }) => {
        this.teachersList = teachers ?? [];
        this.teachersById = new Map(this.teachersList.map((t) => [t.id, t]));
        this.currentSchedules = this.hydrateSchedulesWithTeachers(
          (schedules ?? []) as ScheduleDTO[]
        );
      },
    });

    this.scheduleForm.get('teacherId')!.valueChanges.subscribe((teacherId) => {
      this.applyTeacherContext(teacherId);
      this.scheduleForm.patchValue(
        {
          subjectName: null,
          educationalLevel: null,
          subjectScope: null,
        },
        { emitEvent: false }
      );
      this.availableClassScopes = [];
    });

    this.scheduleForm
      .get('subjectName')!
      .valueChanges.subscribe((subjectName) => {
        this.selectedSubjectDetail =
          this.selectedTeacherFullData?.subjects?.find(
            (s) => s.name === subjectName
          );

        this.scheduleForm.patchValue(
          {
            educationalLevel: null,
            subjectScope: null,
          },
          { emitEvent: false }
        );
        this.availableClassScopes = [];
      });

    this.scheduleForm.get('educationalLevel')!.valueChanges.subscribe((lvl) => {
      const list = this.AllClasses[lvl as string] || [];
      this.availableClassScopes = list;
      this.scheduleForm.patchValue(
        { subjectScope: null },
        { emitEvent: false }
      );
    });
  }

  private hydrateSchedulesWithTeachers(
    schedules: ScheduleDTO[]
  ): ClassSchedule[] {
    return (schedules || [])
      .map((s) => {
        const idNum = Number(s.id);
        if (Number.isNaN(idNum)) return null;

        const { id, ...rest } = s;
        const t = this.teachersById.get(s.teacher_id);

        return {
          id: idNum,
          ...rest,
          teacher_name: t ? t.name : `المعلم غير موجود (ID: ${s.teacher_id})`,
        } as ClassSchedule;
      })
      .filter((x): x is ClassSchedule => !!x);
  }

  private applyTeacherContext(teacherId: number | null): void {
    this.selectedTeacherFullData = teacherId
      ? this.teachersById.get(teacherId)
      : undefined;
    this.availableSubjectsNames = this.selectedTeacherFullData
      ? this.selectedTeacherFullData.subjects.map((s) => s.name)
      : [];
  }

  private pad2(n: number) {
    return String(n).padStart(2, '0');
  }
  private formatTime24(d: Date): string {
    return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}:00`;
  }

  private buildSchedulePayload(): any {
    const v = this.scheduleForm.value;
    return {
      teacher_id: v.teacherId,
      subject: v.subjectName,
      day: v.day,
      start_time: this.formatTime24(v.startTime as Date),
      class_level_scope: v.subjectScope,
      class_name: v.className ?? '',
    };
  }

  private refreshSchedules(): void {
    this.teacherService.getAllSchedules().subscribe({
      next: (schedules: ScheduleDTO[]) => {
        this.currentSchedules = this.hydrateSchedulesWithTeachers(schedules);
      },
    });
  }

  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string
  ): void {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }

  resetFormState(resetAll = true): void {
    this.scheduleForm.reset({
      teacherId: null,
      subjectName: null,
      educationalLevel: null,
      subjectScope: null,
      day: null,
      startTime: null,
      className: null,
    });
    this.availableSubjectsNames = [];
    this.availableClassScopes = [];
    this.selectedTeacherFullData = undefined;
    this.selectedSubjectDetail = undefined;
    if (resetAll) {
      this.isEditing = false;
      this.editingScheduleId = null;
    }
  }

  setScheduleForEdit(schedule: ClassSchedule): void {
    this.isEditing = true;
    this.editingScheduleId = schedule.id;

    const teacherId = Number(schedule.teacher_id);
    this.applyTeacherContext(teacherId);

    const level =
      Object.keys(this.AllClasses).find((lvl) =>
        this.AllClasses[lvl].includes(schedule.class_level_scope ?? '')
      ) ?? null;
    const scopes = level ? this.AllClasses[level] : [];
    this.availableClassScopes = scopes;

    let startDate: Date | null = null;
    if (schedule.start_time) {
      const [h, m] = String(schedule.start_time)
        .split(':')
        .map((n) => parseInt(n, 10));
      const d = new Date();
      d.setHours(h || 0, m || 0, 0, 0);
      startDate = d;
    }

    this.scheduleForm.patchValue(
      {
        teacherId,
        subjectName: schedule.subject,
        educationalLevel: level,
        subjectScope: schedule.class_level_scope ?? null,
        day: schedule.day,
        startTime: startDate,
        className: schedule.class_name || null,
      },
      { emitEvent: false }
    );
  }

  cancelEdit(): void {
    this.resetFormState(true);
    this.showToast('info', 'إلغاء', 'تم إلغاء التعديل.');
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      this.showToast('warn', 'تحذير', 'الرجاء إكمال جميع الحقول المطلوبة.');
      return;
    }

    if (this.isEditing) {
      this.updateSchedule();
      return;
    }

    const payload = this.buildSchedulePayload();
    this.teacherService.addSchedule(payload).subscribe({
      next: (response) => {
        if (response?.error) {
          const err = response?.error;
          this.showToast('error', 'فشل الإضافة', `خطأ: ${err.message}`);
        } else {
          this.showToast('success', 'نجاح', 'تمت إضافة الموعد الجديد بنجاح!');
          this.refreshSchedules();
          this.resetFormState(true);
        }
      },
      error: (err) => {
        this.showToast(
          'error',
          'خطأ في الاتصال',
          'حدث خطأ أثناء الاتصال لإضافة الموعد.'
        );
      },
    });
  }

  updateSchedule(): void {
    if (!this.editingScheduleId) return;
    const payload = this.buildSchedulePayload();

    this.teacherService
      .updateSchedule(this.editingScheduleId, payload)
      .subscribe({
        next: (response) => {
          if (response?.error) {
            const err = response?.error;
            this.showToast('error', 'فشل التعديل', `خطأ: ${err.message}`);
          } else {
            this.showToast('success', 'نجاح', 'تم تعديل الموعد بنجاح!');
            this.refreshSchedules();
            this.resetFormState(true);
          }
        },
        error: (err) => {
          this.showToast(
            'error',
            'خطأ في الاتصال',
            'حدث خطأ أثناء الاتصال لتعديل الموعد.'
          );
        },
      });
  }

  deleteSchedule(scheduleId: number | null | undefined): void {
    const idToDelete = Number(scheduleId);
    if (scheduleId == null || Number.isNaN(idToDelete)) {
      this.showToast('warn', 'تحذير', '⚠️ لا يمكن الحذف. معرف الحصة غير صالح.');
      return;
    }

    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.teacherService.deleteSchedule(idToDelete).subscribe({
          next: (response) => {
            if (response?.error) {
              const err = response?.error;
              this.showToast('error', 'فشل الحذف', `خطأ: ${err.message}`);
            } else {
              this.showToast('success', 'نجاح', '✅ تم حذف الموعد بنجاح!');
              this.refreshSchedules();
              if (this.editingScheduleId === idToDelete)
                this.resetFormState(true);
            }
          },
          error: (err) => {
            this.showToast(
              'error',
              'خطأ في الاتصال',
              'حدث خطأ أثناء الاتصال لحذف الموعد.'
            );
          },
        });
      },
      reject: () => this.showToast('info', 'إلغاء', 'تم إلغاء عملية الحذف.'),
    });
  }

  get saveLabel(): string {
    return this.isEditing ? 'حفظ التعديل' : 'إضافة جدول حصص';
  }
  get saveClass(): string {
    return this.isEditing
      ? 'p-button-lg p-button-warning'
      : 'p-button-lg p-button-primary';
  }
  get disableSave(): boolean {
    return this.scheduleForm.invalid;
  }
}
