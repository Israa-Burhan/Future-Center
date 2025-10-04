import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ValidationMessagePage } from '../../../shared/components/validation-message/validation-message.page';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ValidationMessagePage,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {
  loading = false;

  form = this.fb.group({
    email: [
      '',
      [
        RxwebValidators.required({ message: 'البريد الإلكتروني مطلوب' }),
        RxwebValidators.email({ message: 'صيغة البريد غير صحيحة' }),
      ],
    ],
    password: [
      '',
      [
        RxwebValidators.required({ message: 'كلمة المرور مطلوبة' }),
        RxwebValidators.minLength({
          value: 6,
          message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        }),
      ],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    try {
      await this.auth.login(this.form.value.email!, this.form.value.password!);

      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') ||
        '/admin/dashboard';

      this.router.navigateByUrl(returnUrl);
      this.messageService.add({
        severity: 'success',
        summary: 'تم الدخول',
        detail: 'مرحبا بك 👋',
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: err.message || 'بيانات الدخول غير صحيحة',
      });
    } finally {
      this.loading = false;
    }
  }
}
