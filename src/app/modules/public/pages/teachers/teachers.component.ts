import { TeacherService } from './../../../../core/services/teacher.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { Teacher } from '../../../../core/models/teacher.model';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    RippleModule,
  ],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.scss',
})
export class TeachersComponent {
  selectedTeacher: Teacher | undefined;
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
      }
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
  goBack() {
    this.router.navigate(['/'], { fragment: 'teachers' });
  }
}
