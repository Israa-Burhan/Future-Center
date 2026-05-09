import { Injectable } from '@angular/core';
import {
  ClassSchedule,
  Teacher,
  TeacherInsert,
  TeacherRecord,
  SubjectDetail,
} from '../models/teacher.model';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { supabase } from './supabase.client';

const TEACHERS_TABLE = 'teachers';
const SCHEDULES_TABLE = 'class_schedule';
const TEACHER_IMAGE_BUCKET = 'teacher-images';

function parseSubjects(raw: unknown): SubjectDetail[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw as SubjectDetail[];
  }
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? (v as SubjectDetail[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToTeacher(row: Record<string, unknown>): Teacher {
  const subjects = parseSubjects(row['subjects']);
  return {
    id: Number(row['teacher_id']),
    name: String(row['full_name'] ?? ''),
    title: String(row['job_title'] ?? ''),
    subjects,
    experience: Number(row['experience'] ?? 0),
    university: String(row['university'] ?? ''),
    image: String(row['image'] ?? ''),
    desc: String(row['description'] ?? ''),
  };
}

function rowToTeacherRecord(row: Record<string, unknown>): TeacherRecord {
  return {
    teacher_id: Number(row['teacher_id']),
    full_name: String(row['full_name'] ?? ''),
    phone: (row['phone'] as string | null) ?? null,
    job_title: (row['job_title'] as string | null) ?? null,
    subjects: parseSubjects(row['subjects']),
    experience: Number(row['experience'] ?? 0),
    university: (row['university'] as string | null) ?? null,
    image: (row['image'] as string | null) ?? null,
    description: (row['description'] as string | null) ?? null,
    notes: (row['notes'] as string | null) ?? null,
    created_at: row['created_at'] as string | undefined,
    updated_at: row['updated_at'] as string | undefined,
  };
}

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  /** Full rows for admin CRUD (includes phone, notes). */
  getAllTeacherRecords(): Observable<TeacherRecord[]> {
    const supabasePromise = supabase
      .from(TEACHERS_TABLE)
      .select('*')
      .order('teacher_id', { ascending: true });

    return from(supabasePromise).pipe(
      map((response: { data: unknown; error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        const rows = (response.data ?? []) as Record<string, unknown>[];
        return rows.map(rowToTeacherRecord);
      })
    );
  }

  getAllTeachers(): Observable<Teacher[]> {
    const supabasePromise = supabase
      .from(TEACHERS_TABLE)
      .select('*')
      .order('teacher_id', { ascending: true });

    return from(supabasePromise).pipe(
      map((response: { data: unknown; error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        const rows = (response.data ?? []) as Record<string, unknown>[];
        return rows.map(rowToTeacher);
      })
    );
  }

  getTeacherById(id: number): Observable<Teacher | undefined> {
    const supabasePromise = supabase
      .from(TEACHERS_TABLE)
      .select('*')
      .eq('teacher_id', id)
      .maybeSingle();

    return from(supabasePromise).pipe(
      map((response: { data: unknown; error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        if (!response.data) {
          return undefined;
        }
        return rowToTeacher(response.data as Record<string, unknown>);
      })
    );
  }

  insertTeacher(data: TeacherInsert): Observable<TeacherRecord> {
    const payload = {
      full_name: data.full_name,
      phone: data.phone,
      job_title: data.job_title,
      subjects: data.subjects,
      experience: data.experience,
      university: data.university,
      image: data.image,
      description: data.description,
      notes: data.notes,
    };

    const promise = supabase.from(TEACHERS_TABLE).insert([payload]).select();

    return from(promise).pipe(
      map((response: { data: unknown; error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        const rows = response.data as TeacherRecord[] | null;
        if (!rows?.length) {
          throw new Error('No teacher returned after insert.');
        }
        const row = rows[0];
        return {
          ...row,
          subjects: parseSubjects(row.subjects as unknown),
        } as TeacherRecord;
      })
    );
  }

  updateTeacher(
    teacherId: number,
    data: Partial<TeacherInsert>
  ): Observable<TeacherRecord> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.full_name !== undefined) {
      payload['full_name'] = data.full_name;
    }
    if (data.phone !== undefined) {
      payload['phone'] = data.phone;
    }
    if (data.job_title !== undefined) {
      payload['job_title'] = data.job_title;
    }
    if (data.subjects !== undefined) {
      payload['subjects'] = data.subjects;
    }
    if (data.experience !== undefined) {
      payload['experience'] = data.experience;
    }
    if (data.university !== undefined) {
      payload['university'] = data.university;
    }
    if (data.image !== undefined) {
      payload['image'] = data.image;
    }
    if (data.description !== undefined) {
      payload['description'] = data.description;
    }
    if (data.notes !== undefined) {
      payload['notes'] = data.notes;
    }

    const promise = supabase
      .from(TEACHERS_TABLE)
      .update(payload)
      .eq('teacher_id', teacherId)
      .select();

    return from(promise).pipe(
      map((response: { data: unknown; error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        const rows = response.data as TeacherRecord[] | null;
        if (!rows?.length) {
          throw new Error('No teacher returned after update.');
        }
        const row = rows[0];
        return {
          ...row,
          subjects: parseSubjects(row.subjects as unknown),
        } as TeacherRecord;
      })
    );
  }

  deleteTeacher(teacherId: number): Observable<void> {
    const promise = supabase
      .from(TEACHERS_TABLE)
      .delete()
      .eq('teacher_id', teacherId);

    return from(promise).pipe(
      map((response: { error: Error | null }) => {
        if (response.error) {
          throw response.error;
        }
        return undefined;
      })
    );
  }

  getSchedulesByTeacherId(teacherId: number): Observable<ClassSchedule[]> {
    const columns =
      'id, teacher_id, subject, day, start_time, class_level_scope, class_name';

    const supabasePromise = supabase
      .from(SCHEDULES_TABLE)
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

  addSchedule(scheduleData: Record<string, unknown>): Observable<any> {
    const supabasePromise = supabase
      .from(SCHEDULES_TABLE)
      .insert([scheduleData])
      .select();

    return from(supabasePromise);
  }

  getAllSchedules(): Observable<any[]> {
    const columns =
      'id, teacher_id, subject, day, start_time, class_level_scope, class_name';

    const supabasePromise = supabase
      .from(SCHEDULES_TABLE)
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

  updateSchedule(id: number, scheduleData: Record<string, unknown>): Observable<any> {
    const promise = supabase
      .from(SCHEDULES_TABLE)
      .update(scheduleData)
      .eq('id', id)
      .select();

    return from(promise);
  }

  deleteSchedule(id: number): Observable<any> {
    const promise = supabase.from(SCHEDULES_TABLE).delete().eq('id', id);

    return from(promise);
  }

  /** Uploads to Supabase Storage and returns the public URL for `teachers.image`. */
  uploadTeacherPortrait(
    file: File,
    opts?: { teacherId?: number }
  ): Observable<string> {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return throwError(
        () =>
          new Error(
            'نوع الملف غير مسموح. استخدم صورة JPG أو PNG أو WEBP أو GIF.'
          )
      );
    }
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      return throwError(
        () => new Error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت.')
      );
    }

    const ext =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type === 'image/gif'
            ? 'gif'
            : 'jpg';

    const uuid =
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : String(Date.now());

    const folder =
      opts?.teacherId != null
        ? `teacher-${opts.teacherId}`
        : `pending-${uuid}`;
    const path = `${folder}/${uuid}.${ext}`;

    const promise = supabase.storage
      .from(TEACHER_IMAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type || `image/${ext}`,
      });

    return from(promise).pipe(
      switchMap((result: { error: Error | null }) => {
        if (result.error) {
          return throwError(() => result.error);
        }
        const { data } = supabase.storage
          .from(TEACHER_IMAGE_BUCKET)
          .getPublicUrl(path);
        return of(data.publicUrl);
      })
    );
  }
}
