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
  @Input() messages?: Record<string, string>;

  resolveMessage(): string {
    if (!this.control?.errors) return '';
    const key = Object.keys(this.control.errors)[0];
    const err = (this.control.errors as any)[key];

    if (err?.message) return err.message;
    if (this.messages?.[key]) return this.messages[key];
    switch (key) {
      case 'required':
        return 'هذا الحقل مطلوب';
      case 'email':
        return 'صيغة البريد غير صحيحة';
      case 'minlength':
        return `الحد الأدنى ${err?.requiredLength} أحرف`;
      case 'maxlength':
        return `الحد الأقصى ${err?.requiredLength} أحرف`;
      case 'pattern':
        return 'القيمة لا تطابق النمط المطلوب';
      default:
        return 'تحقق من الحقل';
    }
  }
}
