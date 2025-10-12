import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
interface Teacher {
  id: number;
  name: string;
  subject: string;
  image: string;
}
@Component({
  selector: 'app-team-teachers',
  standalone: true,
  imports: [CarouselModule, CommonModule, RouterLink],
  templateUrl: './team-teachers.component.html',
  styleUrl: './team-teachers.component.scss',
})
export class TeamTeachersComponent {
  teachers: Teacher[] = [];
  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.teachers = [
      {
        id: 1,
        name: 'أ. محمد حسين',
        subject: 'مواد شرعية',
        image: '../../../../../../assets/images/teachers/محمد حسين.jpg',
      },
      {
        id: 2,
        name: ' أ.أحمد محمد عبد المطلب',
        subject: ' أخصائي صعوبات تعلم وأطفال التوحد',
        image: '../../../../../../assets/images/teachers/احمد عبدالمطلب.jpg',
      },
      {
        id: 3,
        name: 'أ. محمد بشير',
        subject: 'العلوم',
        image: '../../../../../../assets/images/teachers/omar.jpg',
      },
      {
        id: 4,
        name: 'أ. أحمد طايع',
        subject: 'الرياضيات ',
        image: '../../../../../../assets/images/teachers/omar.jpg',
      },
      {
        id: 5,
        name: ' أ. أبو بكر أبو الحجاج',
        subject: 'اللغة الإنجليزية',
        image: '../../../../../../assets/images/teachers/omar.jpg',
      },
      {
        id: 6,
        name: 'أ. عمر  عبيد',
        subject: 'اللغة العربية',
        image: '../../../../../../assets/images/teachers/omar.jpg',
      },
      {
        id: 7,
        name: 'أ. محمد عبدالموجود',
        subject: 'الدراسات الاجتماعية ',
        image: '../../../../../../assets/images/teachers/omar.jpg',
      },
    ];

    this.responsiveOptions = [
      { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
      { breakpoint: '991px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 },
    ];
  }
}
