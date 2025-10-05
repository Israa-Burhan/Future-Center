import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './validation-message.page.html',
  styleUrl: './validation-message.page.scss',
})
export class ValidationMessagePage {
  @Input() control?: AbstractControl | null;

  getErrorMessage(): string {
    if (!this.control?.errors) return '';

    const errorKey = Object.keys(this.control.errors)[0];
    const error = this.control.errors[errorKey];

    switch (errorKey) {
      case 'required':
        return 'هذا الحقل مطلوب';
      case 'email':
        return 'صيغة البريد غير صحيحة';
      case 'minlength':
        return `يجب إدخال ${error.requiredLength} أحرف على الأقل`;
      case 'maxlength':
        return `الحد الأقصى هو ${error.requiredLength} أحرف`;
      default:
        return error.message || 'خطأ في الإدخال';
    }
  }
}
