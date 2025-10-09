import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

type FaqItem = { q: string; a: string };

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  query = signal<string>('');

  faqs = signal<FaqItem[]>([
    {
      q: 'ما هي مواعيد الحصص خلال الأسبوع؟',
      a: 'من السبت إلى الخميس بين 4 مساءً و10 مساءً، وتختلف المواعيد حسب المرحلة والشعبة.',
    },
    {
      q: 'كيف يتم الدفع؟ وهل يوجد دفع أونلاين؟',
      a: 'الدفع شهريًا نقدًا في السنتر حاليًا. سنوفر الدفع الإلكتروني لاحقًا.',
    },
    {
      q: 'هل يمكن متابعة حضور الطالب؟',
      a: 'نعم، يتم تسجيل الحضور يوميًا ويمكن للإدارة استخراج تقارير بالحضور والغياب.',
    },
    {
      q: 'هل يمكن تعويض الحصة عند الغياب؟',
      a: 'يتم التنسيق للتعويض حسب سياسة الشعبة وتوفر مواعيد بديلة.',
    },
    {
      q: 'هل يمكن تغيير الشعبة أو المادة؟',
      a: 'نعم، يمكن التحويل حسب توافر الأماكن وبالتنسيق مع الإدارة.',
    },
  ]);

  filtered = computed(() => {
    const q = this.query().trim();
    if (!q) return this.faqs();
    const n = q.toLowerCase();
    return this.faqs().filter(
      (f) => f.q.toLowerCase().includes(n) || f.a.toLowerCase().includes(n)
    );
  });
}
