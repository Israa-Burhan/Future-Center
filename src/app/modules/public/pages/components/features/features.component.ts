import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
}
@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'pi pi-graduation-cap',
      title: 'تعليم حضوري متكامل',
      desc: 'نوفر بيئة صفّية تفاعلية تساعد الطلبة على الفهم والمشاركة الفعّالة داخل الصفوف الدراسية.',
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      icon: 'pi pi-book',
      title: 'مناهج لجميع المراحل الدراسية',
      desc: 'نقدم دورات تغطي المناهج الدراسية لجميع المراحل من الابتدائية إلى الثانوية.',
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      icon: 'pi pi-users',
      title: 'كوادر تعليمية مؤهلة',
      desc: 'يُقدّم الدروس معلمون وخبراء ذوو كفاءة عالية وخبرة طويلة في المجال التربوي.',
      color: '#ca8a04',
      bgColor: '#fef9c3',
    },
    {
      icon: 'pi pi-heart',
      title: 'دعم تربوي مستمر',
      desc: 'نحرص على متابعة تقدم الطالب وتقديم التوجيه المستمر له ولأولياء الأمور لضمان أفضل النتائج.',
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
  ];
}
