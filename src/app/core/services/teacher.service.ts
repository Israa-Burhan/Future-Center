import { Injectable } from '@angular/core';
import { Teacher } from '../models/teacher.model';
import { Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private teachersData: Teacher[] = [
    {
      id: 1,
      name: ' أ. محمد حسين محمدين',
      title: ' مدرس العلوم الشرعية',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
      ],
      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 2,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 3,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 4,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 5,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 6,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],
      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 7,
      name: 'أ. سارة محمد',
      title: 'مدرسة علوم',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'الصف الخامس',
        },
        { name: 'علوم القرآن', teaching_scope: 'الصف الثانوي' },
      ],

      experience: 7,
      university: 'جامعة البصرة',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
  ];

  constructor() {}

  /**
   * تجلب قائمة جميع المعلمين
   * (في المستقبل، سيتم استبدالها باستدعاء HTTP/Supabase)
   */
  getAllTeachers(): Observable<Teacher[]> {
    // نستخدم 'of' لمحاكاة الإرسال غير المتزامن (Asynchronous) كأنها استدعاء حقيقي
    return of(this.teachersData);
  }

  /**
   * تجلب تفاصيل معلم واحد حسب المعرّف (ID)
   */
  getTeacherById(id: number): Observable<Teacher | undefined> {
    const teacher = this.teachersData.find((t) => t.id === id);
    return of(teacher);
  }
}
