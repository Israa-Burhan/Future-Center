import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, take } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, SelectItem } from 'primeng/api';

import {
  SubjectService,
  Subject,
  SubjectInsert,
} from '../../../../../core/services/subject.service';
import { ValidationMessagePage } from '../../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AcademicDataService } from '../../../../../core/services/academic-data.service';

@Component({
  selector: 'app-subjects',
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
  ],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.scss',
})
export class SubjectsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private academicDataService = inject(AcademicDataService);
  subjectForm!: FormGroup;
  subjects$!: Observable<(Subject & { created_at: Date })[]>;

  stages: string[] = [];
  availableSubjectNames: string[] = [];
  availableYearLevels: SelectItem[] = [];
  isEditing: boolean = false;
  editingSubjectId: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadSubjects();
    this.academicDataService
      .getAllStages()
      .pipe(take(1))
      .subscribe((s) => (this.stages = s));

    this.subjectForm
      .get('educational_stage')
      ?.valueChanges.subscribe((stage) => {
        this.updateAvailableFields(stage);
      });
  }

  initForm(): void {
    this.subjectForm = this.fb.group({
      educational_stage: [null as string | null, RxwebValidators.required()],
      subject_name: [null as string | null, RxwebValidators.required()],
      year_level_code: [null as number | null, RxwebValidators.required()],
      base_price: [
        null as number | null,
        [RxwebValidators.required(), Validators.min(0)],
      ],
    });
  }

  loadSubjects(): void {
    this.subjects$ = this.subjectService.getAllSubjects();
  }

  updateAvailableFields(stage: string): void {
    this.academicDataService
      .getSubjectNames(stage)
      .pipe(take(1))
      .subscribe((names) => {
        this.availableSubjectNames = names;
        this.subjectForm.get('subject_name')?.setValue(null);
      });

    this.academicDataService
      .getYearLevels(stage)
      .pipe(take(1))
      .subscribe((levels) => {
        this.availableYearLevels = levels;

        const currentYearCode = this.subjectForm.get('year_level_code')?.value;
        const isValueValid = this.availableYearLevels.some(
          (l) => l.value === currentYearCode
        );
        if (currentYearCode !== null && !isValueValid) {
          this.subjectForm.get('year_level_code')?.setValue(null);
        }
      });
  }
  updateSubject(): void {
    if (!this.editingSubjectId) return;
    const subjectData: SubjectInsert = this.subjectForm.value;

    this.subjectService
      .updateSubject(this.editingSubjectId, subjectData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.showUpdateSuccess('المادة');
          this.loadSubjects();
          this.resetFormState(true);
        },

        error: (err) => {
          this.notificationService.showError(
            'حدث خطأ أثناء الاتصال لتعديل المادة.',
            'خطأ في الاتصال'
          );
          console.error('خطأ في التعديل:', err);
        },
      });
  }
  saveSubject(): void {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      this.notificationService.showWarning(
        'الرجاء إكمال جميع الحقول المطلوبة.'
      );
      return;
    }

    if (this.isEditing) {
      this.updateSubject();
      return;
    }

    const subjectData: SubjectInsert = this.subjectForm.value;

    this.subjectService.addSubject(subjectData).subscribe({
      next: () => {
        this.notificationService.showAddSuccess('المادة الجديدة');
        this.loadSubjects();
        this.resetFormState(true);
      },
      error: (err) => {
        this.notificationService.showError(
          'حدث خطأ أثناء الاتصال لإضافة المادة.',
          'خطأ في الاتصال'
        );
        console.error('خطأ في الإضافة:', err);
      },
    });
  }

  editSubject(subject: Subject): void {
    this.isEditing = true;
    this.editingSubjectId = subject.subject_id;

    this.updateAvailableFields(subject.educational_stage);

    this.subjectForm.patchValue({
      subject_name: subject.subject_name,
      educational_stage: subject.educational_stage,
      year_level_code: subject.year_level_code,
      base_price: subject.base_price,
    });
  }

  resetFormState(resetAll = true): void {
    this.subjectForm.reset(
      {
        educational_stage: null,
        subject_name: null,
        year_level_code: null,
        base_price: null,
      },
      { emitEvent: false }
    );

    this.availableSubjectNames = [];
    this.availableYearLevels = [];

    if (resetAll) {
      this.isEditing = false;
      this.editingSubjectId = null;
    }
  }

  cancelEdit(): void {
    this.resetFormState(true);
    this.notificationService.showCancelSuccess('عملية التعديل. ');
  }

  deleteSubject(subjectId: string | null | undefined): void {
    const idToDelete = subjectId;
    if (!idToDelete) {
      this.notificationService.showWarning(
        '⚠️ لا يمكن الحذف. معرف المادة غير صالح.'
      );
      return;
    }

    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.subjectService.deleteSubject(idToDelete).subscribe({
          next: () => {
            this.notificationService.showDeleteSuccess('المادة');
            this.loadSubjects();
            if (this.editingSubjectId === idToDelete) this.resetFormState(true);
          },
          error: (err) => {
            this.notificationService.showError(
              'حدث خطأ أثناء الاتصال لحذف المادة.',
              'خطأ في الاتصال'
            );
            console.error('خطأ في الحذف:', err);
          },
        });
      },
      reject: () =>
        this.notificationService.showCancelSuccess('  عملية الحذف.'),
    });
  }

  get saveLabel(): string {
    return this.isEditing ? 'حفظ التعديل' : 'إضافة المادة';
  }

  get saveClass(): string {
    return this.isEditing ? 'p-button-warning' : 'p-button-primary';
  }

  get disableSave(): boolean {
    return this.subjectForm.invalid;
  }
}
