import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardHomeComponent } from './dashboard-home.component';
import { DashboardService } from '../../../../../core/services/dashboard.service';
import { NotificationService } from '../../../../../core/services/notification.service';

describe('DashboardHomeComponent', () => {
  let component: DashboardHomeComponent;
  let fixture: ComponentFixture<DashboardHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            loadStats: () =>
              of({
                totalStudents: 10,
                newStudentsThisMonth: 2,
                newStudentsLastMonth: 1,
                distinctTeachers: 3,
                revenueThisMonth: 1000,
                revenueLastMonth: 500,
                subjectsCount: 12,
                scheduleRowsCount: 8,
                activeStudentsCount: 9,
              }),
            loadMonthlyTrend: () =>
              of([
                {
                  monthKey: '2026-01-01',
                  label: 'يناير 2026',
                  revenue: 500,
                  newStudents: 1,
                },
                {
                  monthKey: '2026-02-01',
                  label: 'فبراير 2026',
                  revenue: 800,
                  newStudents: 2,
                },
              ]),
          },
        },
        {
          provide: NotificationService,
          useValue: { showError: () => undefined },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
