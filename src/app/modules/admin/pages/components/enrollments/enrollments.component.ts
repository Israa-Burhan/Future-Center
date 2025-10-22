import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Observable,
  switchMap,
  startWith,
  of,
  BehaviorSubject,
  map,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import {
  AttendanceService,
  SessionWithDetails,
  AttendanceRecordWithDetails,
} from '../../../../../core/services/attendance.service';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';
import {
  StudentService,
  Subject,
} from '../../../../../core/services/students.service';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
    CardModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    CalendarModule,
  ],
  templateUrl: './enrollments.component.html',
  styleUrl: './enrollments.component.scss',
})
export class EnrollmentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private academicDataService = inject(AcademicDataService);
  private studentService = inject(StudentService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  filterForm: FormGroup;
  sessions$: Observable<SessionWithDetails[]> = of([]);
  displayAdvancedFilter: boolean = false;
  stages$: Observable<SelectItem[]>;
  yearLevels$: Observable<SelectItem[]>;
  subjects$ = new BehaviorSubject<Subject[]>([]);

  displayReviewModal: boolean = false;
  reviewRecords$: Observable<AttendanceRecordWithDetails[] | null> = of(null);
  reviewSessionTitle: string = '';

  constructor() {
    this.filterForm = this.fb.group({
      searchText: [null as string | null],
      sessionDate: [null as string | null],
      stage: [null as string | null],
      yearLevel: [null as number | null],
      subjectId: [null as string | null],
    });

    this.stages$ = this.academicDataService.stages$;
    this.yearLevels$ = of([]);
  }

  ngOnInit(): void {
    this.setupAcademicFiltering();
    this.setupSubjectFiltering();
    this.setupDataFetching();
  }

  get f() {
    return this.filterForm.controls;
  }

  setupAcademicFiltering(): void {
    const stageControl = this.filterForm.get('stage');
    const yearLevelControl = this.filterForm.get('yearLevel');

    if (stageControl && yearLevelControl) {
      this.yearLevels$ = stageControl.valueChanges.pipe(
        startWith(stageControl.value),
        switchMap((selectedStage: string | null) => {
          if (!selectedStage) return of([]);
          return this.academicDataService.getYearLevels(selectedStage);
        })
      );
      stageControl.valueChanges.subscribe(() => {
        yearLevelControl.setValue(null, { emitEvent: true });
        this.filterForm.get('subjectId')?.setValue(null, { emitEvent: false });
      });
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
        });
    }
  }

  setupDataFetching(): void {
    this.sessions$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap((filters) => {
        return this.attendanceService.getFilteredSessions(filters);
      })
    );
  }

  reviewSession(session: SessionWithDetails): void {
    this.reviewSessionTitle = `مراجعة سجل الحضور -  الصف ${session.year_level} - ${session.subjects?.subject_name} -(${session.session_date})`;

    this.reviewRecords$ = this.attendanceService
      .getAttendanceRecordsBySession(session.id)
      .pipe(
        map((records) => {
          if (records.length === 0) {
            this.notificationService.showWarning(
              'الجلسة لا تحتوي على سجلات حضور بعد.'
            );
            return null;
          }
          return records;
        })
      );
    this.displayReviewModal = true;
  }

  editSession(session: SessionWithDetails): void {
    this.router.navigate(['/admin/attendance'], {
      queryParams: { sessionId: session.id },
    });
  }
  clearFilters(): void {
    this.filterForm.reset({
      searchText: null,
      sessionDate: null,
      stage: null,
      yearLevel: null,
      subjectId: null,
    });
    this.displayAdvancedFilter = false;
  }

  deleteSession(sessionId: string): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الجلسة وسجلاتها؟ سيتم الحذف بشكل دائم.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'لا',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.attendanceService.deleteSession(sessionId).subscribe({
          next: () => {
            this.notificationService.showDeleteSuccess(' الجلسة وسجلاتها');
            this.filterForm.updateValueAndValidity();
          },
          error: (err) => {
            console.error('فشل في حذف الجلسة:', err);
            this.notificationService.showError('فشل في حذف الجلسة');
          },
        });
      },
      reject: () => {
        this.notificationService.showInfo('تم إلغاء عملية الحذف');
      },
    });
  }
}
