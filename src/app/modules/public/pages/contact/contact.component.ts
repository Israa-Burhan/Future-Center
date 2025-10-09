import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { supabase } from '../../../../core/services/supabase.client';
import { DropdownModule } from 'primeng/dropdown';
import { AccordionModule } from 'primeng/accordion';
import { ValidationMessagePage } from '../../../shared/components/validation-message/validation-message.page';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    DividerModule,
    ToastModule,
    DropdownModule,
    AccordionModule,
    ValidationMessagePage,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class ContactComponent {
  loading = false;

  codes = [
    { label: '+20', value: '+20' },
    { label: '+966', value: '+966' },
    { label: '+971', value: '+971' },
  ];
  subjects = [
    { label: 'استفسار عام', value: 'عام' },
    { label: 'مواعيد الحصص', value: 'مواعيد' },
    { label: 'الاشتراكات والمدفوعات', value: 'مدفوعات' },
    { label: 'مشكلة تقنية', value: 'تقني' },
  ];

  form = this.fb.group({
    firstName: [
      '',
      [
        RxwebValidators.required({ message: 'الاسم الأول مطلوب' }),
        RxwebValidators.minLength({ value: 2, message: 'أقل طول للاسم هو 2' }),
      ],
    ],
    lastName: [
      '',
      [
        RxwebValidators.required({ message: 'اسم العائلة مطلوب' }),
        RxwebValidators.minLength({ value: 2, message: 'أقل طول للاسم هو 2' }),
      ],
    ],
    email: ['', [RxwebValidators.email({ message: 'صيغة البريد غير صحيحة' })]],
    code: ['+20', [RxwebValidators.required({ message: 'اختر كود الدولة' })]],
    phone: [
      '',
      [
        RxwebValidators.required({ message: 'رقم الهاتف مطلوب' }),
        RxwebValidators.pattern({
          expression: { phone: /^\d{8,10}$/ },
          message: 'اكتب 8–10 أرقام بدون كود',
        }),
      ],
    ],
    subject: ['عام', [RxwebValidators.required({ message: 'اختر موضوعًا' })]],
    message: [
      '',
      [
        RxwebValidators.required({ message: 'اكتب رسالتك' }),
        RxwebValidators.minLength({
          value: 10,
          message: 'الرسالة يجب أن تكون 10 أحرف على الأقل',
        }),
        RxwebValidators.maxLength({
          value: 700,
          message: 'الحد الأقصى 700 حرف',
        }),
      ],
    ],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly toast: MessageService
  ) {}

  get f() {
    return this.form.controls;
  }

  async submit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      this.toast.add({
        severity: 'warn',
        summary: 'ينقصك بعض البيانات',
        detail: 'أكمل الحقول المطلوبة.',
      });
      return;
    }

    this.loading = true;
    try {
      const payload = {
        name: `${this.form.value.firstName} ${this.form.value.lastName}`.trim(),
        phone: `${this.form.value.code}${this.form.value.phone}`,
        email: this.form.value.email || null,
        subject: this.form.value.subject!,
        message: this.form.value.message!,
      };

      const { error } = await supabase
        .from('contact_messages')
        .insert([payload]);
      if (error) throw error;

      this.toast.add({
        severity: 'success',
        summary: 'تم الإرسال',
        detail: 'وصلتنا رسالتك وسنتواصل معك قريبًا.',
      });
      this.form.reset({ code: '+20', subject: 'عام' });
    } catch (e: any) {
      this.toast.add({
        severity: 'error',
        summary: 'تعذر الإرسال',
        detail: e?.message || 'حاول مرة أخرى.',
      });
    } finally {
      this.loading = false;
    }
  }
}
