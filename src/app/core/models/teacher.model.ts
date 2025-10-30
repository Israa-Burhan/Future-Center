export interface SubjectDetail {
  name: string;
  teaching_scope: string;
}
export interface Teacher {
  id: number;
  name: string;
  title: string;
  subjects: SubjectDetail[];
  experience: number;
  image: string;
  university: string;
  desc: string;
}
export interface ClassSchedule {
  id: number;
  teacher_id: number;
  day: string;
  start_time: string;
  class_name?: string;
  subject: string;
  class_level_scope: string;
}

export interface TeacherPayment {
  payment_id: string;
  teacher_id: number;
  month_year: string;

  base_wage: number;
  bonuses: number;
  deductions: number;
  final_amount: number;

  is_paid: boolean;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentInsertUpdate {
  payment_id?: string;

  teacher_id: number;
  month_year: string;

  base_wage: number;
  bonuses: number;
  deductions: number;
  final_amount: number;

  is_paid: boolean;
  paid_at: string | null;
  notes: string | null;
}
