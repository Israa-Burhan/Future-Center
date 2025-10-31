import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectItem } from 'primeng/api';

interface Stage {
  label: string;
  value: string;
}

const STAGE_SUBJECT_MAP: { [key: string]: string[] } = {
  ابتدائي: [
    'اللغة العربية',
    'رياضيات',
    'علوم',
    'مادة الدين',
    'اللغة الإنجليزية',
    'الدراسات الاجتماعية',
  ],
  إعدادي: [
    'رياضيات',
    'اللغة العربية',
    'علوم ',
    'اللغة الإنجليزية',
    'الدراسات الاجتماعية',
    'اصول دين',
    'فقه ',
    'تجويد',
  ],
  ثانوي: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'فيزياء',
    'كيمياء',
    'أحياء',
    'رياضيات ',
    'تاريخ',
    'جغرافيا',
    'فرنسي',
    'علوم شرعية',
  ],
  'اخصائي تنمية مهارات واطفال التوحد': [' تنمية المهارات و وصعوبات التعلم '],
};

const ALL_YEAR_LEVELS_DATA: { label: string; value: number; stage: string }[] =
  [
    { label: 'الصف الأول', value: 1, stage: 'ابتدائي' },
    { label: 'الصف الثاني', value: 2, stage: 'ابتدائي' },
    { label: 'الصف الثالث', value: 3, stage: 'ابتدائي' },
    { label: 'الصف الرابع', value: 4, stage: 'ابتدائي' },
    { label: 'الصف الخامس', value: 5, stage: 'ابتدائي' },
    { label: 'الصف السادس', value: 6, stage: 'ابتدائي' },
    { label: 'الصف الأول الإعدادي', value: 7, stage: 'إعدادي' },
    { label: 'الصف الثاني الإعدادي', value: 8, stage: 'إعدادي' },
    { label: 'الصف الثالث الإعدادي', value: 9, stage: 'إعدادي' },
    { label: 'الصف الأول الثانوي ', value: 10, stage: 'ثانوي' },
    { label: 'الصف الثاني الثانوي', value: 11, stage: 'ثانوي' },
    { label: 'الصف الثالث الثانوي ', value: 12, stage: 'ثانوي' },
  ];

@Injectable({
  providedIn: 'root',
})
export class AcademicDataService {
  public stages$: Observable<Stage[]> = of([
    { label: 'ابتدائي', value: 'ابتدائي' },
    { label: 'إعدادي', value: 'إعدادي' },
    { label: 'ثانوي', value: 'ثانوي' },
    {
      label: 'اخصائي تنمية مهارات واطفال التوحد',
      value: 'اخصائي تنمية مهارات واطفال التوحد',
    },
  ]);

  getSubjectNames(stage: string | null): Observable<string[]> {
    if (!stage || !STAGE_SUBJECT_MAP[stage]) {
      return of([]);
    }
    return of(STAGE_SUBJECT_MAP[stage]);
  }

  getYearLevels(stage: string | null): Observable<SelectItem[]> {
    if (!stage) {
      return of([]);
    }
    if (stage === 'اخصائي تنمية مهارات واطفال التوحد') {
      const ageRangeItem: SelectItem = {
        label: 'من عمر 5 إلى 16 سنة',
        value: 13,
      };
      return of([ageRangeItem]);
    }
    const filteredLevels: SelectItem[] = ALL_YEAR_LEVELS_DATA.filter(
      (item) => item.stage === stage
    ).map(
      (level) =>
        ({
          label: level.label,
          value: level.value,
        } as SelectItem)
    );

    return of(filteredLevels);
  }

  getAllStages(): Observable<string[]> {
    return of(Object.keys(STAGE_SUBJECT_MAP));
  }
}
