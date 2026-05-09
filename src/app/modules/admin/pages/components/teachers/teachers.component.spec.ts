import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TeachersComponent } from './teachers.component';
import { TeacherService } from '../../../../../core/services/teacher.service';
import { NotificationService } from '../../../../../core/services/notification.service';
describe('TeachersComponent', () => {
  let component: TeachersComponent;
  let fixture: ComponentFixture<TeachersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersComponent],
      providers: [
        {
          provide: TeacherService,
          useValue: {
            getAllTeacherRecords: () => of([]),
            insertTeacher: () => of({}),
            updateTeacher: () => of({}),
            deleteTeacher: () => of(undefined),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            showWarning: () => undefined,
            showError: () => undefined,
            showSuccess: () => undefined,
            showCancelSuccess: () => undefined,
            showAddSuccess: () => undefined,
            showUpdateSuccess: () => undefined,
            showDeleteSuccess: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
