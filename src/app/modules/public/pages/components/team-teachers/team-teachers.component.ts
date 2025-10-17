import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { Teacher } from '../../../../../core/models/teacher.model';
import { TeacherService } from '../../../../../core/services/teacher.service';

@Component({
  selector: 'app-team-teachers',
  standalone: true,
  imports: [CarouselModule, CommonModule, RouterLink],
  templateUrl: './team-teachers.component.html',
  styleUrl: './team-teachers.component.scss',
})
export class TeamTeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  responsiveOptions: any[] | undefined;
  constructor(private teacherService: TeacherService) {}
  ngOnInit() {
    this.teacherService.getAllTeachers().subscribe((data) => {
      this.teachers = data;
    });

    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 3, numScroll: 1 },
      { breakpoint: '991px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 },
    ];
  }
  getGeneralSubjects(teacher: Teacher | undefined): string {
    if (!teacher || !teacher.subjects || teacher.subjects.length === 0) {
      return 'متخصص';
    }
    return teacher.subjects.map((s) => s.name).join(' | ');
  }
}
