import { Injectable } from '@angular/core';
import { from, Observable, map, catchError } from 'rxjs';
import { supabase } from './supabase.client';

export interface PaymentInsertUpdate {
  student_id: string;
  month_year: string;
  is_paid: boolean;
  subject_id: string;
  method?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  base_price: number;
  discount_percent: number;
  final_price: number;
  payment_id?: string;
}

export interface PaymentResult {
  payment_id: string;
  paid_at: string | null;
  is_paid: boolean;
  method: string | null;
  notes: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private PAYMENTS_TABLE = 'student_payments';
  private supabase: any = supabase;

  savePayment(payments: PaymentInsertUpdate[]): Observable<PaymentResult[]> {
    const paymentsToRpc = payments.map((p) => {
      const { payment_id, ...data } = p;
      return data;
    });

    return from(
      this.supabase.rpc('upsert_student_payments', {
        payments_data: paymentsToRpc,
      })
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return (response.data as PaymentResult[]) || [];
      }),
      catchError((error) => {
        console.error('Error executing RPC upsert_student_payments:', error);
        throw error;
      })
    );
  }

  updatePayment(
    paymentId: string,
    paymentData: Partial<PaymentInsertUpdate>
  ): Observable<PaymentResult> {
    const dataToUpdate: Partial<PaymentInsertUpdate> = {
      ...paymentData,
      method: paymentData.is_paid ? paymentData.method : null,
      paid_at: paymentData.is_paid
        ? paymentData.paid_at || new Date().toISOString()
        : null,
    };

    const supabasePromise = supabase
      .from(this.PAYMENTS_TABLE)
      .update(dataToUpdate)
      .eq('payment_id', paymentId)
      .select(`payment_id, paid_at, is_paid, method, notes`)
      .single();

    return from(supabasePromise).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data as PaymentResult;
      }),
      catchError((error) => {
        console.error('Error updating payment:', error);
        throw error;
      })
    );
  }
}
