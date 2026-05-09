import { Injectable } from '@angular/core';
import {
  from,
  Observable,
  map,
  of,
  catchError,
  switchMap,
  forkJoin,
} from 'rxjs';
import { supabase } from './supabase.client';

export interface Subject {
  subject_id: string;
  subject_name: string;
  educational_stage: string;
  year_level_code: number;
  base_price: number;
}

export interface Student {
  student_id: string;
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
interface StudentMapItem {
  student_id: string;
  full_name: string;
  year_level: string;
  year_level_id: number;
  stage: string;
  discount_percent: number;
  subscribed_subjects: string[];
}

export type StudentInsert = Omit<
  Student,
  'student_id' | 'created_at' | 'status'
> & {
  phone?: string | null;
  guardian_phone?: string | null;
  notes?: string | null;
};
export interface PaymentStudentFilters {
  stage: string | null;
  yearLevel: number | null;
  subjectId: string | null;
  paymentMonth: string | null;
  paymentStatus: 'all' | 'paid' | 'unpaid';
}
export interface FilteredStudentResult {
  student_id: string;
  full_name: string;
  year_level: number;
  year_level_id: number;
  stage: string;
  subscribed_subjects: Subject[];
  total_base_price: number;
  discount_percent: number;
  final_price: number;

  isPresent: boolean;
  attendanceNotes: string | null;
  payment_id: string | null;
  is_paid: boolean;
  month_year: string;
  method: string | null;
  notes: string | null;
  paid_at: string | null;
}
export interface SimpleStudentFilters {
  stage: string | null;
  yearLevel: number | null;
  subjectId: string | null;
}
@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private STUDENTS_TABLE = 'students';
  private SUBJECTS_TABLE = 'subjects';
  private PAYMENTS_TABLE = 'student_payments';

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

  getAllStudents(): Observable<Student[]> {
    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .select(
        `student_id,
            full_name,
            phone,
            guardian_phone,
            grade,
            year_level,
            subscribed_subjects,
            fee_plan,
            discount_percent,
            school_name,
            academic_year,
            notes,
            created_at,
            status`
      )
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
  deleteStudent(student_id: string): Observable<any> {
    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .delete()
      .eq('student_id', student_id);

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      })
    );
  }
  updateStudent(
    student_id: string,
    studentData: StudentInsert
  ): Observable<Student> {
    const dataToUpdate: Partial<StudentInsert> = {
      ...studentData,
      notes: studentData.notes || null,
    };

    const supabasePromise = supabase
      .from(this.STUDENTS_TABLE)
      .update(dataToUpdate)
      .eq('student_id', student_id)
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

  getFilteredStudents(
    filters: SimpleStudentFilters
  ): Observable<FilteredStudentResult[] | null> {
    if (!filters.yearLevel || !filters.subjectId) {
      return of(null);
    }

    const selectedSubjectId = filters.subjectId as string;
    const selectedYearLevel = filters.yearLevel as number;

    const subjectDetails$ = from(
      supabase
        .from(this.SUBJECTS_TABLE)
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
                 student_id,
                 full_name,
                 year_level,
                discount_percent
                            `
            )
            .eq('year_level', selectedYearLevel)
            .contains('subscribed_subjects', [selectedSubjectId]);

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

                  payment_id: null,
                  is_paid: false,
                  month_year: '',
                  method: null,
                  notes: null,
                  paid_at: null,
                  isPresent: false,
                  attendanceNotes: null,
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

  getStudentsWithPaymentSummary(
    filters: PaymentStudentFilters
  ): Observable<FilteredStudentResult[] | null> {
    if (!filters.yearLevel || !filters.paymentMonth) {
      return of(null);
    }

    const selectedYearLevel = filters.yearLevel as number;
    const selectedMonthYear = filters.paymentMonth as string;
    const paymentStatusFilter = filters.paymentStatus;

    const studentQuery = supabase
      .from(this.STUDENTS_TABLE)
      .select(
        `
            student_id,
            full_name,
            year_level,
            discount_percent,
            subscribed_subjects
        `
      )
      .eq('year_level', selectedYearLevel);

    return from(studentQuery).pipe(
      switchMap((studentResponse: any) => {
        if (studentResponse.error) {
          throw studentResponse.error;
        }

        const studentsData = studentResponse.data as StudentMapItem[];
        if (studentsData.length === 0) {
          return of([]);
        }

        const studentIds = studentsData.map((s) => s.student_id);

        const allSubscribedSubjectIds = Array.from(
          new Set(
            studentsData
              .flatMap((s) => s.subscribed_subjects || [])
              .filter((id) => id)
          )
        );

        const subjectDetailsQuery = supabase
          .from(this.SUBJECTS_TABLE)
          .select(
            `subject_id, subject_name, educational_stage, year_level_code, base_price`
          )
          .in('subject_id', allSubscribedSubjectIds);

        const paymentsQuery = supabase
          .from(this.PAYMENTS_TABLE)
          .select(`payment_id, student_id, is_paid, method, notes, paid_at`)
          .in('student_id', studentIds)
          .eq('month_year', selectedMonthYear);

        return forkJoin([
          of(studentsData),
          from(subjectDetailsQuery).pipe(
            map((res) => (res.data as Subject[]) || [])
          ),
          from(paymentsQuery).pipe(map((res) => res.data || [])),
        ]);
      }),
      map(([studentsData, subjectDetails, paymentsData]) => {
        const paymentsMap = new Map(
          paymentsData.map((p: any) => [p.student_id, p])
        );
        const subjectDetailsMap = new Map<string, Subject>(
          subjectDetails.map((s: Subject) => [s.subject_id, s])
        );

        const finalResults: FilteredStudentResult[] = [];

        (studentsData as StudentMapItem[]).forEach((student) => {
          const studentSubjects: Subject[] = [];
          let totalBasePrice = 0;

          (student.subscribed_subjects || []).forEach((subjectId: string) => {
            const detail = subjectDetailsMap.get(subjectId);
            if (detail) {
              studentSubjects.push(detail);
              totalBasePrice += detail.base_price;
            }
          });

          if (studentSubjects.length === 0) {
            return;
          }

          const discount = student.discount_percent || 0;
          const finalPrice = totalBasePrice * (1 - discount / 100);
          const payment = paymentsMap.get(student.student_id);

          const studentResult: FilteredStudentResult = {
            student_id: student.student_id,
            full_name: student.full_name,
            year_level: student.year_level as unknown as number,

            subscribed_subjects: studentSubjects,
            total_base_price: totalBasePrice,
            discount_percent: discount,
            final_price: finalPrice,

            payment_id: payment?.payment_id || null,
            is_paid: payment?.is_paid || false,
            method: payment?.method || null,
            notes: payment?.notes || null,
            paid_at: payment?.paid_at || null,
            month_year: selectedMonthYear,

            isPresent: false,
            attendanceNotes: null,
          } as FilteredStudentResult;

          const shouldInclude =
            paymentStatusFilter === 'all' ||
            (paymentStatusFilter === 'paid' && studentResult.is_paid) ||
            (paymentStatusFilter === 'unpaid' && !studentResult.is_paid);

          if (shouldInclude) {
            finalResults.push(studentResult);
          }
        });

        return finalResults;
      }),
      catchError((error) => {
        console.error('Final Supabase Query Error:', error);
        return of(null);
      })
    );
  }
}
