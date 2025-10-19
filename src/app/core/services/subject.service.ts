import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Subject {
  subject_id: string;
  subject_name: string;
  educational_stage: string;
  year_level_code: number;
  base_price: number;
  is_deleted: boolean;
}

export type SubjectInsert = Omit<Subject, 'subject_id' | 'is_deleted'>;

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private SUBJECTS_TABLE = 'subjects';

  getAllSubjects(): Observable<(Subject & { created_at: Date })[]> {
    const columns =
      'subject_id, subject_name, educational_stage, year_level_code, base_price, created_at';

    const supabasePromise = supabase
      .from(this.SUBJECTS_TABLE)
      .select(columns)
      .eq('is_deleted', false)
      .order('educational_stage', { ascending: true })
      .order('year_level_code', { ascending: true });

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      })
    );
  }

  addSubject(subjectData: SubjectInsert): Observable<any> {
    const supabasePromise = supabase
      .from(this.SUBJECTS_TABLE)
      .insert([subjectData])
      .select();

    return from(supabasePromise);
  }

  updateSubject(
    id: string,
    subjectData: Partial<SubjectInsert>
  ): Observable<any> {
    const promise = supabase
      .from(this.SUBJECTS_TABLE)
      .update(subjectData)
      .eq('subject_id', id)
      .select();

    return from(promise);
  }

  deleteSubject(id: string): Observable<any> {
    const promise = supabase
      .from(this.SUBJECTS_TABLE)
      .delete()
      .eq('subject_id', id);

    return from(promise);
  }
}
