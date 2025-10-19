import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  of,
  switchMap,
  startWith,
  BehaviorSubject,
  catchError,
  map,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { SelectItem } from 'primeng/api';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';

import {
  StudentService,
  Subject,
  FilteredStudentResult,
} from '../../../../../core/services/students.service';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
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
  ],
  templateUrl: './student-price-summary.component.html',
  styleUrl: './student-price-summary.component.scss',
})
export class StudentPriceSummaryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private academicDataService = inject(AcademicDataService);
  private studentService = inject(StudentService);

  filterForm!: FormGroup;

  stages$!: Observable<SelectItem[]>;
  yearLevels$!: Observable<SelectItem[]>;
  subjects$ = new BehaviorSubject<Subject[]>([]);
  filteredStudents$: Observable<FilteredStudentResult[] | null> = of(null);
  isSearching: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.stages$ = this.academicDataService.stages$;
    this.setupAcademicFiltering();
    this.setupSubjectFiltering();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      stage: [null as string | null, RxwebValidators.required()],
      yearLevel: [null as number | null, RxwebValidators.required()],
      subjectId: [null as string[] | null, RxwebValidators.required()],
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
          return this.academicDataService.getYearLevels(selectedStage);
        })
      );

      stageControl.valueChanges.subscribe(() => {
        yearLevelControl.setValue(null, { emitEvent: true });
        this.filteredStudents$ = of([]);
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
          this.filteredStudents$ = of([]);
        });
    }
  }

  searchStudents(): void {
    const filters = this.filterForm.value;

    if (!filters.yearLevel || !filters.subjectId) {
      console.warn('الرجاء اختيار الصف والمادة للبدء بالبحث.');
      this.filteredStudents$ = of([]);
      return;
    }

    this.isSearching = true;

    this.filteredStudents$ = this.studentService
      .getFilteredStudents(filters)
      .pipe(
        catchError((err) => {
          console.error('خطأ في جلب الطلاب المفلترين:', err);
          return of([]);
        }),
        map((results) => {
          this.isSearching = false;
          return results;
        })
      );
  }
  clearSearch(): void {
    this.filterForm.reset({
      stage: null,
      yearLevel: null,
      subjectId: null,
    });

    this.filteredStudents$ = of([]);
    this.subjects$.next([]);
    this.yearLevels$ = of([]);

    this.isSearching = false;
  }
  get f() {
    return this.filterForm.controls;
  }
}
