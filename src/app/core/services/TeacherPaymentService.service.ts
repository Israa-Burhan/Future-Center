import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from './supabase.client';
import { TeacherPayment, PaymentInsertUpdate } from '../models/teacher.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherPaymentService {
  private readonly PAYMENTS_TABLE = 'teacher_payments';

  getPaymentsByMonth(monthDateISO: string): Observable<TeacherPayment[]> {
    const supabasePromise = supabase
      .from(this.PAYMENTS_TABLE)
      .select('*')
      .eq('month_year', monthDateISO);

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as TeacherPayment[];
      })
    );
  }

  savePayment(paymentData: PaymentInsertUpdate): Observable<TeacherPayment> {
    const promise = supabase
      .from(this.PAYMENTS_TABLE)
      .upsert([paymentData], {
        onConflict: 'teacher_id,month_year',
      })
      .select();

    return from(promise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }

        const savedRecords = response.data as TeacherPayment[];

        if (savedRecords && savedRecords.length > 0) {
          return savedRecords[0];
        }

        throw new Error('No payment data was returned after save/update.');
      })
    );
  }
}
