import { TeacherService } from './../../../../core/services/teacher.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // 💡 إضافة OnInit
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { Teacher, ClassSchedule } from '../../../../core/models/teacher.model';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    RippleModule,
    TableModule,
  ],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.scss',
})
export class TeachersComponent implements OnInit {
  selectedTeacher: Teacher | undefined;
  teacherSchedules: ClassSchedule[] = [];
  isLoadingSchedules: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        const teacherId = +id;

        this.teacherService.getTeacherById(teacherId).subscribe((teacher) => {
          this.selectedTeacher = teacher;
        });

        this.loadTeacherSchedules(teacherId);
      } else {
        this.isLoadingSchedules = false;
      }
    });
  }

  loadTeacherSchedules(teacherId: number): void {
    this.isLoadingSchedules = true;
    this.teacherService.getSchedulesByTeacherId(teacherId).subscribe({
      next: (schedules) => {
        this.teacherSchedules = schedules;
        this.isLoadingSchedules = false;
      },
      error: (err) => {
        console.error('فشل جلب مواعيد المعلم:', err);
        this.isLoadingSchedules = false;
      },
    });
  }

  get generalSubjects(): string {
    if (!this.selectedTeacher || !this.selectedTeacher.subjects) {
      return 'غير محدد';
    }
    return this.selectedTeacher.subjects.map((s) => s.name).join(' | ');
  }

  get detailedSubjectScopes(): string {
    if (
      !this.selectedTeacher ||
      !this.selectedTeacher.subjects ||
      this.selectedTeacher.subjects.length === 0
    ) {
      return 'غير محدد';
    }
    const subjects = this.selectedTeacher.subjects;
    if (subjects.length === 1) {
      return subjects[0].teaching_scope;
    }
    const detailedScopes = subjects.map(
      (s) => `${s.name} (${s.teaching_scope})`
    );
    return detailedScopes.join(' , ');
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      let hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
      hour = hour % 12;
      hour = hour ? hour : 12;
      const minute = minutes.padStart(2, '0');
      return `${hour}:${minute} ${ampm}`;
    } catch {
      return timeString;
    }
  }

  goBack() {
    this.router.navigate(['/'], { fragment: 'teachers' });
  }

  get subjectFlexDirectionClass(): string {
    if (
      this.selectedTeacher &&
      this.selectedTeacher.subjects &&
      this.selectedTeacher.subjects.length > 1
    ) {
      return 'flex-column xl:flex-row align-items-start';
    }
    return 'flex-row align-items-center';
  }
}
