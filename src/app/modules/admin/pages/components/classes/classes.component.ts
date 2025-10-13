import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../../../../core/services/teacher.service';
import {
  Teacher,
  ClassSchedule,
  SubjectDetail,
} from '../../../../../core/models/teacher.model';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, SelectItem, ConfirmationService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ClassesComponent implements OnInit {
  newSchedule: {
    teacherId: number | null;
    subjectName: string | null;
    day: string | null;
    startTime: Date | null;
    className: string | null;
  } = {
    teacherId: null,
    subjectName: null,
    day: null,
    startTime: null,
    className: null,
  };

  teachersList: Teacher[] = [];
  availableSubjectsNames: string[] = [];
  selectedEducationalLevel: string | null = null;
  availableClassScopes: string[] = [];
  selectedSubjectScope: string | null = null;
  private selectedTeacherFullData: Teacher | undefined;
  private selectedSubjectDetail: SubjectDetail | undefined;
  currentSchedules: ClassSchedule[] = [];
  isEditing: boolean = false;
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

  AllClasses: { [key: string]: string[] } = {
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

  constructor(
    private teacherService: TeacherService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.teacherService.getAllTeachers().subscribe((data) => {
      this.teachersList = data;
    });
    this.loadCurrentSchedules();
  }

  loadCurrentSchedules(): void {
    this.teacherService.getAllSchedules().subscribe({
      next: (schedules: any[]) => {
        this.currentSchedules = schedules
          .map((schedule: any) => {
            const teacher = this.teachersList.find(
              (t) => t.id === schedule.teacher_id
            );

            const scheduleId = Number(schedule.id);
            if (isNaN(scheduleId)) {
              console.warn('تم تجاهل جدول بسبب ID غير صالح:', schedule);
              return null;
            }

            return {
              id: scheduleId,
              ...schedule,
              teacher_name: teacher
                ? teacher.name
                : 'المعلم غير موجود (ID: ' + schedule.teacher_id + ')',
            } as ClassSchedule;
          })
          .filter((s): s is ClassSchedule => s !== null);
      },
      error: (err) => {
        console.error('فشل في الاتصال لجلب الجداول:', err);
      },
    });
  }

  onTeacherChange(event: any): void {
    const selectedTeacherId = event.value;

    this.resetFormState(false, true);

    this.newSchedule.teacherId = selectedTeacherId;

    this.selectedTeacherFullData = this.teachersList.find(
      (t) => t.id === selectedTeacherId
    );

    if (this.selectedTeacherFullData) {
      this.availableSubjectsNames = this.selectedTeacherFullData.subjects.map(
        (s) => s.name
      );
    } else {
      this.availableSubjectsNames = [];
    }
  }

  onSubjectChange(event: any): void {
    const selectedSubjectName = event.value;
    this.selectedEducationalLevel = null;
    this.selectedSubjectScope = null;
    this.availableClassScopes = [];
    this.selectedSubjectDetail = undefined;

    if (this.selectedTeacherFullData && selectedSubjectName) {
      this.selectedSubjectDetail = this.selectedTeacherFullData.subjects.find(
        (s) => s.name === selectedSubjectName
      );
    }
  }

  onLevelChange(event: any): void {
    const selectedLevel = event.value as string;
    this.selectedSubjectScope = null;
    this.availableClassScopes = this.AllClasses[selectedLevel] || [];

    if (this.availableClassScopes.length === 0) {
      this.selectedSubjectScope = null;
    }
  }

  onScopeChange(event: any): void {
    this.selectedSubjectScope = event.value;
  }

  resetFormState(
    resetAll: boolean = true,
    resetDependencies: boolean = true
  ): void {
    this.newSchedule = {
      teacherId: null,
      subjectName: null,
      day: null,
      startTime: null,
      className: null,
    };

    this.selectedEducationalLevel = null;
    this.selectedSubjectScope = null;

    this.selectedTeacherFullData = undefined;
    this.selectedSubjectDetail = undefined;

    if (resetDependencies) {
      this.availableSubjectsNames = [];
      this.availableClassScopes = [];
    }

    if (resetAll) {
      this.isEditing = false;
      this.editingScheduleId = null;
    }
  }

  setScheduleForEdit(schedule: ClassSchedule): void {
    this.isEditing = true;
    this.editingScheduleId = schedule.id;
    this.resetFormState(false);

    this.newSchedule.teacherId = Number(schedule.teacher_id);

    this.newSchedule.day = schedule.day;

    this.newSchedule.className = schedule.class_name || null;

    if (schedule.start_time) {
      const timeParts = (schedule.start_time as string).split(':');
      const now = new Date();
      now.setHours(
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10),
        0,
        0
      );
      this.newSchedule.startTime = now;
    }

    this.onTeacherChange({ value: this.newSchedule.teacherId });

    setTimeout(() => {
      this.newSchedule.subjectName = schedule.subject;

      this.onSubjectChange({ value: schedule.subject });

      let foundLevel = false;
      let targetLevel: string | null = null;
      for (const level in this.AllClasses) {
        if (this.AllClasses[level].includes(schedule.class_level_scope!)) {
          targetLevel = level;
          foundLevel = true;
          break;
        }
      }

      if (foundLevel && targetLevel) {
        this.selectedEducationalLevel = targetLevel;

        this.onLevelChange({ value: targetLevel });

        this.selectedSubjectScope = schedule.class_level_scope;
      }
    }, 150);
  }

  cancelEdit(): void {
    this.resetFormState(true);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 5000,
    });
  }
  updateSchedule(): void {
    if (!this.editingScheduleId) return;

    const scheduleToUpdate = this.buildSchedulePayload();

    this.teacherService
      .updateSchedule(this.editingScheduleId, scheduleToUpdate)
      .subscribe({
        next: (response) => {
          if (response.error) {
            console.error('خطأ Supabase في التعديل:', response.error);
            this.showToast(
              'error',
              'فشل التعديل',
              `خطأ: ${response.error.message}`
            );
          } else {
            this.showToast('success', 'نجاح', ' تم تعديل الموعد بنجاح!');
            this.loadCurrentSchedules();
            this.resetFormState(true);
          }
        },
        error: (err) => {
          console.error('خطأ في الاتصال بالشبكة/الخدمة:', err);
          this.showToast(
            'error',
            'خطأ في الاتصال',
            'حدث خطأ أثناء محاولة الاتصال بالخادم لتعديل الموعد.'
          );
        },
      });
  }

  private buildSchedulePayload(): any {
    return {
      teacher_id: this.newSchedule.teacherId,
      subject: this.newSchedule.subjectName,
      day: this.newSchedule.day,

      start_time: this.newSchedule.startTime!.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),

      class_level_scope: this.selectedSubjectScope,

      class_name: this.newSchedule.className ?? '',
    };
  }

  deleteSchedule(scheduleId: number | null | undefined): void {
    const idToDelete = Number(scheduleId);

    if (scheduleId === null || scheduleId === undefined || isNaN(idToDelete)) {
      console.error('ID الحصة غير صالح للحذف (تم منع الإرسال):', scheduleId);
      this.showToast(
        'warn',
        'تحذير',
        '⚠️ لا يمكن الحذف. معرف الحصة غير متوفر أو غير صالح.'
      );
      return;
    }

    this.confirmationService.confirm({
      message:
        'هل أنت متأكد من رغبتك في حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',

      accept: () => {
        this.teacherService.deleteSchedule(idToDelete).subscribe({
          next: (response) => {
            if (response.error) {
              console.error('خطأ Supabase في الحذف:', response.error);
              this.showToast(
                'error',
                'فشل الحذف',
                `خطأ: ${response.error.message}`
              );
            } else {
              this.showToast('success', 'نجاح', '✅ تم حذف الموعد بنجاح!');
              this.loadCurrentSchedules();

              if (this.editingScheduleId === idToDelete) {
                this.resetFormState(true);
              }
            }
          },
          error: (err) => {
            console.error('خطأ في الاتصال بالشبكة/الخدمة:', err);
            this.showToast(
              'error',
              'خطأ في الاتصال',
              'حدث خطأ أثناء محاولة الاتصال بالخادم لحذف الموعد.'
            );
          },
        });
      },
      reject: () => {
        this.showToast('info', 'إلغاء', 'تم إلغاء عملية الحذف.');
      },
    });
  }

  // this.teacherService.deleteSchedule(idToDelete).subscribe({
  //   next: (response) => {
  //     if (response.error) {
  //       console.error('خطأ Supabase في الحذف:', response.error);
  //       this.showToast(
  //         'error',
  //         'فشل الحذف',
  //         `خطأ: ${response.error.message}`
  //       );
  //     } else {
  //       this.showToast('success', 'نجاح', ' تم حذف الموعد بنجاح!');
  //       this.loadCurrentSchedules();

  //       if (this.editingScheduleId === idToDelete) {
  //         this.resetFormState(true);
  //       }
  //     }
  //   },
  //   error: (err) => {
  //     console.error('خطأ في الاتصال بالشبكة/الخدمة:', err);
  //     this.showToast(
  //       'error',
  //       'خطأ في الاتصال',
  //       'حدث خطأ أثناء محاولة الاتصال بالخادم لحذف الموعد.'
  //     );
  //   },
  // });

  saveSchedule(): void {
    if (
      !this.newSchedule.teacherId ||
      !this.newSchedule.subjectName ||
      !this.newSchedule.day ||
      !this.newSchedule.startTime ||
      !this.selectedSubjectScope
    ) {
      this.showToast('warn', 'تحذير', 'الرجاء إكمال جميع الحقول المطلوبة.');
      return;
    }

    if (this.isEditing) {
      this.updateSchedule();
    } else {
      const scheduleToSend = this.buildSchedulePayload();

      this.teacherService.addSchedule(scheduleToSend).subscribe({
        next: (response) => {
          if (response.error) {
            console.error('خطأ Supabase في الإرسال:', response.error);
            this.showToast(
              'error',
              'فشل الإضافة',
              `خطأ: ${response.error.message}`
            );
          } else {
            this.showToast(
              'success',
              'نجاح',
              ' تمت إضافة الموعد الجديد بنجاح!'
            );
            this.loadCurrentSchedules();
            this.resetFormState(true);
          }
        },
        error: (err) => {
          console.error('خطأ في الاتصال بالشبكة/الخدمة:', err);
          this.showToast(
            'error',
            'خطأ في الاتصال',
            'حدث خطأ أثناء محاولة الاتصال بالخادم لإضافة الموعد.'
          );
        },
      });
    }
  }
}
