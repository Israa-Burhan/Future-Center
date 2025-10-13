import { Injectable } from '@angular/core';
import { ClassSchedule, Teacher } from '../models/teacher.model';
import { from, map, Observable, of } from 'rxjs';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private SCHEDULES_TABLE = 'class_schedule';

  private teachersData: Teacher[] = [
    {
      id: 1,
      name: ' أ. محمد حسين محمدين',
      title: ' مدرس العلوم الشرعية',
      subjects: [
        {
          name: 'التربية الدينية',
          teaching_scope: 'اعدادي - ثانوي ',
        },
        { name: 'العلوم الشرعية', teaching_scope: 'جميع المراحل التعليمية ' },
      ],
      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/محمد حسين.jpg',
      desc: 'يركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 2,
      name: 'أ. محمد ابراهيم عبيد بشير',
      title: 'محمد بشير ',
      subjects: [
        {
          name: ' العلوم',
          teaching_scope: 'المرحلة الابتدائية',
        },
        { name: ' الفيزياء', teaching_scope: 'اعدادي - ثانوي' },
      ],
      experience: 4,
      university: 'جامعة الأزهر',
      image: '/assets/images/teachers/محمد بشير.jpg',
      desc: 'طالب ماجستير قسم علم النفس التعليمي بكلية التربية جامعة الأزهر',
    },
    {
      id: 3,
      name: 'أ. محمود عبدالموجود حسيب',
      title: 'مدرس الدراسات الاجتماعية ',
      subjects: [
        {
          name: 'الدراسات الاجتماعية (التاريخ - الجغرافيا) ',
          teaching_scope: 'للمراحل الابتدائية - الاعدادية - الثانوية',
        },
      ],
      experience: 3,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/محمود عبدالموجود.jpg',
      desc: 'مدرس في مدرسة الاقالته الاعدادية المشتركة',
    },
    {
      id: 4,
      name: 'أ. احمد محمد طايع',
      title: 'مدرس الرياضيات',
      subjects: [
        {
          name: 'الرياضيات ',
          teaching_scope: ' جميع المراحل التعليمية',
        },
      ],
      experience: 4,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/احمد طايع.jpg',
      desc: 'مدرس في مدرسة القرنه بنين الاعدادية ',
    },
    {
      id: 5,
      name: 'أ. عمر عبيد',
      title: 'مدرس اللغة العربية',
      subjects: [
        {
          name: 'اللغة العربية',
          teaching_scope: 'جميع المراحل التعليمية',
        },
      ],
      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'مدرس فس سنتر فيوتشر التعليمي',
    },
    {
      id: 6,
      name: 'أ. ابو بكر ابو الحجاج',
      title: 'مدرس اللغة الانجليزية ',
      subjects: [
        {
          name: ' اللغة الانجليزية',
          teaching_scope: 'جميع المراحل التعليمية',
        },
      ],
      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/omar.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
    {
      id: 7,
      name: 'أ. احمد عبدالمطلب ',
      title: 'اخصائي صعوبات التعلم ',
      subjects: [
        {
          name: 'اخصائي صعوبات التعلم واطفال التوحد',
          teaching_scope: 'جميع المراحل التعليمية',
        },
      ],

      experience: 7,
      university: 'جامعة الأقصر',
      image: '/assets/images/teachers/احمد عبدالمطلب.jpg',
      desc: 'تركز على تنمية التفكير العلمي لدى الطلاب من خلال التجارب والأمثلة الواقعية، وتشغل حاليًا منصب منسقة العلوم في المنصة التعليمية.',
    },
  ];

  getAllTeachers(): Observable<Teacher[]> {
    return of(this.teachersData);
  }

  getTeacherById(id: number): Observable<Teacher | undefined> {
    const teacher = this.teachersData.find((t) => t.id === id);
    return of(teacher);
  }

  getSchedulesByTeacherId(teacherId: number): Observable<ClassSchedule[]> {
    const columns =
      'id, teacher_id, subject, day, start_time, class_level_scope, class_name';

    const supabasePromise = supabase
      .from(this.SCHEDULES_TABLE)
      .select(columns)

      .eq('teacher_id', teacherId)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }

        return response.data as ClassSchedule[];
      })
    );
  }

  addSchedule(scheduleData: any): Observable<any> {
    const supabasePromise = supabase
      .from(this.SCHEDULES_TABLE)
      .insert([scheduleData])
      .select();

    return from(supabasePromise);
  }

  getAllSchedules(): Observable<any> {
    const columns =
      'id, teacher_id, subject, day, start_time, class_level_scope, class_name';

    const supabasePromise = supabase
      .from(this.SCHEDULES_TABLE)
      .select(columns)
      .order('id', { ascending: true });
    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      })
    );
  }

  updateSchedule(id: number, scheduleData: any): Observable<any> {
    const promise = supabase
      .from(this.SCHEDULES_TABLE)
      .update(scheduleData)
      .eq('id', id)
      .select();

    return from(promise);
  }

  deleteSchedule(id: number): Observable<any> {
    const promise = supabase.from(this.SCHEDULES_TABLE).delete().eq('id', id);

    return from(promise);
  }
}
