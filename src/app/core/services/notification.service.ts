// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageService = inject(MessageService);

  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 5000
  ): void {
    this.messageService.add({ severity, summary, detail, life });
  }

  public showSuccess(detail: string, summary: string = 'نجاح'): void {
    this.showToast('success', summary, detail);
  }

  public showError(detail: string, summary: string = 'خطأ'): void {
    this.showToast('error', summary, detail);
  }

  public showWarning(detail: string, summary: string = 'تحذير'): void {
    this.showToast('warn', summary, detail);
  }

  public showInfo(detail: string, summary: string = 'الغاء'): void {
    this.showToast('info', summary, detail);
  }

  public showAddSuccess(item: string = 'البيانات'): void {
    this.showSuccess(`تمت إضافة ${item} بنجاح!`);
  }

  public showUpdateSuccess(item: string = 'البيانات'): void {
    this.showSuccess(`تم تعديل ${item} بنجاح!`);
  }

  public showDeleteSuccess(item: string = 'البيانات'): void {
    this.showSuccess(`تم حذف ${item} بنجاح!`);
  }
  public showCancelSuccess(item: string = 'البيانات'): void {
    this.showInfo(`تم إلغاء ${item} `);
  }
}
