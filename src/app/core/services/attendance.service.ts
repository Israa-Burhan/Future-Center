import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { supabase } from './supabase.client';
import { Subject } from './subject.service';

export interface DailySession {
  id: string;
  subject_id: string;
  session_date: string;
  year_level: number;
  notes: string | null;
  locked_at: string | null;
  created_at: string;
}

export interface AttendanceRecordInput {
  id?: string;
  session_id: string;
  student_id: string;
  present: boolean;
  absent_reason: string | null;
}

export interface SessionWithDetails extends DailySession {
  subjects: { subject_name: string } | null;
}

export interface AttendanceRecordWithDetails extends AttendanceRecordInput {
  id: string;

  students: {
    full_name: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private supabase = supabase;

  private SESSIONS_TABLE = 'attendance_sessions';
  private RECORDS_TABLE = 'attendance_records';

  constructor() {}

  openNewSession(filters: {
    subjectId: string;
    yearLevel: number;
    sessionDate: string;
  }): Observable<DailySession> {
    const sessionData = {
      subject_id: filters.subjectId,
      session_date: filters.sessionDate,
      year_level: filters.yearLevel,
      locked_at: null,
    };

    const promise = this.supabase
      .from(this.SESSIONS_TABLE)
      .insert([sessionData])
      .select()
      .single();

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as DailySession;
      }),
      catchError((error) => {
        console.error('Error opening new session:', error);
        return throwError(() => error);
      })
    );
  }

  saveAttendanceRecords(records: AttendanceRecordInput[]): Observable<any> {
    const promise = this.supabase
      .from(this.RECORDS_TABLE)
      .upsert(records, { onConflict: 'session_id, student_id' })
      .select('id');

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Error saving attendance records:', error);
        return throwError(() => error);
      })
    );
  }

  lockSession(sessionId: string): Observable<DailySession> {
    const promise = this.supabase
      .from(this.SESSIONS_TABLE)
      .update({ locked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as DailySession;
      }),
      catchError((error) => {
        console.error('Error locking session:', error);
        return throwError(() => error);
      })
    );
  }

  getFilteredSessions(filters: {
    searchText: string | null;
    sessionDate: string | null;
    yearLevel: number | null;
    subjectId: string | null;
    stage: string | null;
  }): Observable<SessionWithDetails[]> {
    let query = this.supabase
      .from(this.SESSIONS_TABLE)
      .select(`*, subjects (subject_name)`);

    if (filters.searchText) {
      const searchTextLower = filters.searchText.toLowerCase();
      const searchPattern = `%${searchTextLower}%`;

      query = query.filter('subjects.subject_name', 'ilike', searchPattern);

      query = query.not('subjects', 'is', null);
    }

    if (filters.sessionDate) {
      const selectedDate = new Date(filters.sessionDate);

      const startOfDayUTC = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0,
          0
        )
      );

      const endOfDayUTC = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
          999
        )
      );

      query = query.gte('session_date', startOfDayUTC.toISOString());
      query = query.lte('session_date', endOfDayUTC.toISOString());
    }
    if (filters.yearLevel !== null && filters.yearLevel !== undefined) {
      query = query.eq('year_level', filters.yearLevel);
    }

    if (filters.subjectId) {
      query = query.eq('subject_id', filters.subjectId);
    }

    query = query.order('created_at', { ascending: false });

    return from(query).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as SessionWithDetails[];
      }),
      catchError((error) => {
        console.error('Error fetching filtered sessions:', error);
        return of([]);
      })
    );
  }

  getSessionDetails(sessionId: string): Observable<DailySession> {
    const promise = this.supabase
      .from(this.SESSIONS_TABLE)
      .select('*')
      .eq('id', sessionId)
      .single();

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as DailySession;
      }),
      catchError((error) => {
        console.error('Error fetching single session details:', error);
        return throwError(() => error);
      })
    );
  }

  getAttendanceRecordsBySession(
    sessionId: string
  ): Observable<AttendanceRecordWithDetails[]> {
    const promise = this.supabase
      .from(this.RECORDS_TABLE)
      .select(
        `id, session_id, student_id, present, absent_reason, students (full_name)`
      )
      .eq('session_id', sessionId);

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as AttendanceRecordWithDetails[];
      }),
      catchError((error) => {
        console.error('Error fetching attendance records:', error);
        return of([]);
      })
    );
  }

  deleteSession(sessionId: string): Observable<any> {
    const promise = this.supabase
      .from(this.SESSIONS_TABLE)
      .delete()
      .eq('id', sessionId)
      .select();

    return from(promise).pipe(
      map((response) => {
        if (response.error) {
          throw response.error;
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Error deleting session:', error);
        return throwError(() => error);
      })
    );
  }
}
