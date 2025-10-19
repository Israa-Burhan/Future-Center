import { Injectable } from '@angular/core';
import { from, Observable, map, of, catchError, switchMap } from 'rxjs';
import { supabase } from './supabase.client';

export interface Subject {
  subject_id: string;
  subject_name: string;
  educational_stage: string;
  year_level_code: number;
  base_price: number;
  is_deleted: boolean;
}

export interface Student {
  id: string;
  full_name: string;
  phone: string | null;
  guardian_phone: string | null;
  year_level: number;
  grade: string | null;
  status: 'فعّال' | 'مجمد' | 'منسحب';
  school_name: string | null;
  academic_year: string;
  fee_plan: string | null;
  discount_percent: number;
  consent_whatsapp: boolean;
  subscribed_subjects: string[];
  created_at: Date;
  notes: string | null;
  subscribed_subject_names?: string[];
}

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'status'> & {
  phone?: string | null;
  guardian_phone?: string | null;
  notes?: string | null;
};
export interface FilteredStudentResult {
  id: string;
  full_name: string;
  year_level: number;
  subject_id: string;
  subject_name: string;
  base_price: number;
  discount_percent: number;
  final_price: number;
}
@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private STUDENTS_TABLE = 'students';
  private SUBJECTS_TABLE = 'subjects';

  getAllSubjects(): Observable<Subject[]> {
    const supabasePromise = supabase.from(this.SUBJECTS_TABLE).select('*');

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as Subject[];
      })
    );
  }

  // في StudentService.ts
  getAllStudents(): Observable<Student[]> {
    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .select('*')
      .order('year_level', { ascending: true });

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }

        return response.data as Student[];
      })
    );
  }
  getSubjectsByYearLevel(
    yearLevel: number | null | undefined
  ): Observable<Subject[]> {
    if (yearLevel === null || yearLevel === undefined) {
      return of([]);
    }

    const supabasePromise = supabase
      .from(this.SUBJECTS_TABLE)
      .select('*')
      .eq('year_level_code', yearLevel);

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as Subject[];
      })
    );
  }

  addStudent(studentData: StudentInsert): Observable<Student> {
    const dataToInsert: Partial<StudentInsert> = {
      ...studentData,
      phone: studentData.phone || null,
      guardian_phone: studentData.guardian_phone || null,
      grade: studentData.grade || null,
      school_name: studentData.school_name || null,
      fee_plan: studentData.fee_plan || null,
      notes: studentData.notes || null,
    };

    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .insert(dataToInsert)
      .select()
      .single();

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as Student;
      })
    );
  }
  deleteStudent(id: string): Observable<any> {
    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .delete()
      .eq('id', id);

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      })
    );
  }
  updateStudent(id: string, studentData: StudentInsert): Observable<Student> {
    const dataToUpdate: Partial<StudentInsert> = {
      ...studentData,
      notes: studentData.notes || null,
    };

    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as Student;
      })
    );
  }

  getFilteredStudents(filters: {
    stage: string | null;
    yearLevel: number | null;
    subjectId: string | null;
  }): Observable<FilteredStudentResult[] | null> {
    if (!filters.yearLevel || !filters.subjectId) {
      return of(null);
    }

    const selectedSubjectId = filters.subjectId as string;
    const selectedYearLevel = filters.yearLevel as number;

    const subjectDetails$ = from(
      supabase
        .from('subjects')
        .select(`subject_name, base_price`)
        .eq('subject_id', selectedSubjectId)
        .limit(1)
        .single()
    ).pipe(
      map((response: any) => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError((error) => {
        console.error('Error fetching subject price:', error);

        return of({ subject_name: 'خطأ في السعر', base_price: 0 });
      })
    );

    return subjectDetails$.pipe(
      switchMap(
        (subjectDetails: { subject_name: string; base_price: number }) => {
          const basePrice = subjectDetails.base_price;
          const subjectName = subjectDetails.subject_name;

          const studentsPromise = supabase
            .from(this.STUDENTS_TABLE)
            .select(
              `
                    id,
                    full_name,
                    year_level,
                    discount_percent
                `
            )
            .eq('year_level', selectedYearLevel)
            .contains(
              'subscribed_subjects',
              JSON.stringify([selectedSubjectId])
            );

          return from(studentsPromise).pipe(
            map((response: any) => {
              if (response.error) {
                throw response.error;
              }

              return response.data.map((student: any) => {
                const discount = student.discount_percent || 0;
                const finalPrice = basePrice * (1 - discount / 100);

                return {
                  ...student,
                  base_price: basePrice,
                  subject_id: selectedSubjectId,
                  subject_name: subjectName,
                  final_price: finalPrice,
                } as FilteredStudentResult;
              });
            })
          );
        }
      ),
      catchError((error) => {
        console.error('Final Supabase Query Error:', error);
        return of(null);
      })
    );
  }
}
