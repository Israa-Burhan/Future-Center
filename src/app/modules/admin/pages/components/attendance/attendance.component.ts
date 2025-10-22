import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Observable,
  of,
  switchMap,
  startWith,
  BehaviorSubject,
  catchError,
  map,
  finalize,
  take,
  tap,
  forkJoin,
  combineLatest,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { MessageService, SelectItem } from 'primeng/api';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';

import {
  StudentService,
  Subject,
  FilteredStudentResult,
} from '../../../../../core/services/students.service';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import {
  AttendanceService,
  DailySession,
  AttendanceRecordInput,
  AttendanceRecordWithDetails,
} from '../../../../../core/services/attendance.service';

export interface StudentRecordVM extends FilteredStudentResult {
  isPresent: boolean;
  attendanceNotes: string | null;
  recordId: string | null;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    CardModule,
    ValidationMessagePage,
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    InputTextModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
})
export class AttendanceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private academicDataService = inject(AcademicDataService);
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private attendanceService = inject(AttendanceService);

  private notificationService = inject(NotificationService);
  filterForm!: FormGroup;

  stages$!: Observable<SelectItem[]>;
  yearLevels$!: Observable<SelectItem[]>;
  subjects$ = new BehaviorSubject<Subject[]>([]);
  filteredStudents$ = new BehaviorSubject<StudentRecordVM[] | null>(null);
  isSearching: boolean = false;
  sessionLoading: boolean = false;
  currentSession: DailySession | null = null;
  isEditMode: boolean = false;
  sessionIdFromRoute: string | null = null;
  isEditing: boolean = false;
  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.stages$ = this.academicDataService.stages$;
    this.setupAcademicFiltering();
    this.setupSubjectFiltering();
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.sessionIdFromRoute = params['sessionId'] || null;
      if (this.sessionIdFromRoute) {
        this.isEditMode = true;
        console.log('تم الدخول في وضع التعديل:', this.sessionIdFromRoute);
        this.notificationService.showSuccess('تم الدخول في وضع التعديل');
        this.loadSessionForEdit(this.sessionIdFromRoute);
      }
    });
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      sessionDate: [this.getCurrentDate(), RxwebValidators.required()],
      stage: [null as string | null, RxwebValidators.required()],
      yearLevel: [null as number | null, RxwebValidators.required()],
      subjectId: [null as string | null, RxwebValidators.required()],
    });
  }
  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
          return this.academicDataService.getYearLevels(selectedStage);
        })
      );

      stageControl.valueChanges.subscribe(() => {
        yearLevelControl.setValue(null, { emitEvent: true });
        this.filteredStudents$.next(null);
      });
    } else {
      this.yearLevels$ = of([]);
    }
  }

  setupSubjectFiltering(): void {
    const yearLevelControl = this.filterForm.get('yearLevel');
    const subjectIdControl = this.filterForm.get('subjectId');

    if (yearLevelControl && subjectIdControl) {
      yearLevelControl.valueChanges
        .pipe(
          startWith(yearLevelControl.value),
          switchMap((yearLevel: number | null) => {
            if (yearLevel) {
              return this.studentService.getSubjectsByYearLevel(yearLevel);
            }
            return of([] as Subject[]);
          })
        )
        .subscribe((subjects: Subject[]) => {
          this.subjects$.next(subjects);
          subjectIdControl.setValue(null, { emitEvent: false });
          this.filteredStudents$.next(null);
        });
    }
  }

  clearSearch(): void {
    this.filterForm.reset({
      stage: null,
      yearLevel: null,
      subjectId: null,
      sessionDate: this.getCurrentDate(),
    });

    this.filteredStudents$.next(null);
    this.currentSession = null;
    this.isEditMode = false;
    this.sessionIdFromRoute = null;
  }
  get f() {
    return this.filterForm.controls;
  }

  loadSessionForEdit(sessionId: string): void {
    this.sessionLoading = true;
    this.currentSession = null;
    this.attendanceService
      .getSessionDetails(sessionId)
      .pipe(
        tap((session) => {
          this.currentSession = session;
          this.filterForm.patchValue(
            {
              yearLevel: session.year_level,
              subjectId: session.subject_id,
              sessionDate: session.session_date,
            },
            { emitEvent: true }
          );
        }),

        switchMap((session) => {
          const currentStage = this.filterForm.get('stage')?.value || null;

          const filters = {
            stage: currentStage,
            yearLevel: session.year_level,
            subjectId: session.subject_id,
            sessionDate: session.session_date,
          };
          return forkJoin([
            this.studentService.getFilteredStudents(filters).pipe(take(1)),
            this.attendanceService
              .getAttendanceRecordsBySession(sessionId)
              .pipe(take(1)),
          ]);
        }),

        map(([students, records]) => {
          if (!students) return [];
          const recordsMap = new Map(records.map((r) => [r.student_id, r]));

          return students.map((student) => {
            const record = recordsMap.get(student.id);
            return {
              ...student,
              isPresent: record ? record.present : false,
              attendanceNotes: record ? record.absent_reason : null,
              recordId: record ? record.id : null,
            } as StudentRecordVM;
          });
        }),

        catchError((err) => {
          console.error('فشل في تحميل الجلسة للتعديل:', err);
          return of([]);
        }),
        finalize(() => {
          this.sessionLoading = false;
        })
      )
      .subscribe((students) => {
        this.filteredStudents$.next(students);
      });
  }
  fetchStudentsForAttendance(filters: any): void {
    if (this.isEditMode) {
      console.warn('أنت في وضع التعديل. لا يمكنك فتح جلسة جديدة.');
      return;
    }
    const { yearLevel, subjectId, sessionDate } = filters;

    if (!yearLevel || !subjectId || !sessionDate) {
      console.warn('الرجاء تحديد جميع حقول الفلترة المطلوبة لفتح الجلسة.');
      return;
    }

    this.sessionLoading = true;
    this.currentSession = null;

    this.attendanceService
      .openNewSession(filters)
      .pipe(
        tap((session) => {
          this.currentSession = session;
          console.log('تم فتح الجلسة الجديدة بنجاح:', session.id);
          this.notificationService.showSuccess('تم فتح الجلسة الجديدة بنجاح.');
        }),

        switchMap(() => {
          return this.studentService.getFilteredStudents(filters).pipe(take(1));
        }),

        map((students) => {
          if (!students) return [];
          return students.map(
            (student) =>
              ({
                ...student,
                isPresent: true,
                attendanceNotes: null,
                recordId: null,
              } as StudentRecordVM)
          );
        }),

        catchError((err) => {
          console.error('خطأ في فتح الجلسة أو جلب الطلاب:', err);
          this.currentSession = null;
          if (err.code === '23505') {
            this.notificationService.showWarning(
              '⚠️ الجلسة مسجلة بالفعل: توجد جلسة لهذا اليوم والمادة. يرجى التعديل عبر صفحة السجلات.'
            );
          } else {
            this.notificationService.showError(
              'خطاء في فتح الجلسة او جلب الطلاب: ' + err.message
            );
          }
          return of([]);
        }),

        finalize(() => {
          this.sessionLoading = false;
        })
      )
      .subscribe((students) => {
        this.filteredStudents$.next(students);
      });
  }

  lockAndSaveSession(shouldLock: boolean = true): void {
    if (!this.currentSession) {
      console.error('لا توجد جلسة مفتوحة للإغلاق.');
      this.notificationService.showError('لا توجد جلسة مفتوحة للإغلاق.');
      return;
    }

    this.sessionLoading = true;
    const currentSessionId = this.currentSession.id;

    this.filteredStudents$
      .pipe(
        take(1),

        map((students) => {
          if (!students) return [];
          return students.map(
            (student) =>
              ({
                session_id: currentSessionId,
                student_id: student.id,
                present: student.isPresent,
                absent_reason: student.attendanceNotes || null,
              } as AttendanceRecordInput)
          );
        }),

        switchMap((records) => {
          if (records.length === 0) {
            return of(null);
          }
          return this.attendanceService.saveAttendanceRecords(records);
        }),

        switchMap(() => {
          return this.attendanceService.lockSession(currentSessionId);
        }),

        finalize(() => {
          this.sessionLoading = false;
        }),
        catchError((err) => {
          console.error('فشل في إغلاق أو حفظ الجلسة:', err);
          this.notificationService.showError(
            'خطاء في إغلاق الجلسة: ' + err.message
          );
          return of(null);
        })
      )
      .subscribe((lockedSession) => {
        if (lockedSession) {
          this.clearSearch();
          console.log('تم إغلاق الجلسة بنجاح:', lockedSession.locked_at);
          this.notificationService.showSuccess('تم إغلاق الجلسة بنجاح.');
        }
      });
  }
}
