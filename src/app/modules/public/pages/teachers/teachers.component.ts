import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';

interface Teacher {
  id: number;
  name: string;
  title: string;
  subject: string;
  classes: string;
  experience: number;
  image: string;
  university: string;
  desc: string;
}
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
  teachers: Teacher[] = [
    {
      id: 1,
      name: ' أ. محمد حسين محمدين',
      title: ' مدرس العلوم الشرعية',
      subject: 'العلوم الشرعية',
      classes: 'الأعدادي والثانوي',
      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 2,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 3,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 4,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 5,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 6,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 7,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subject: 'العلوم',
      classes: 'الصف الثالث - الصف الرابع',
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
  ];

  selectedTeacher: Teacher | undefined;
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // نقرأ المعرف (id) من الرابط
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.selectedTeacher = this.teachers.find((t) => t.id === +id);
      }
    });
  }

  goBack() {
    this.router.navigate(['/'], { fragment: 'teachers' });
  }
}
