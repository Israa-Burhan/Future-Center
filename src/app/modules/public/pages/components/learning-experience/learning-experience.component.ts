import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

interface Slide {
  title: string;
  desc: string[];
}

@Component({
  selector: 'app-learning-experience',
  standalone: true,
  imports: [CommonModule, CarouselModule, ButtonModule],
  templateUrl: './learning-experience.component.html',
  styleUrl: './learning-experience.component.scss',
})
export class LearningExperienceComponent {
  slides: Slide[] = [
    {
      title: 'بيئة تعليمية محفزة',
      desc: [
        'بيئة آمنة وتشجع الطالب على المشاركة',
        'تنمية مهارات الطلاب بثقة',
        'تعليم تفاعلي مشوق وجذاب',
      ],
    },
    {
      title: 'متابعة شخصية لكل طالب',
      desc: [
        'متابعة تقدم كل طالب بشكل فردي',
        'ضمان فهم كامل للمحتوى الدراسي',
        'تحقيق أفضل النتائج الأكاديمية',
      ],
    },
    {
      title: 'أخصائي تنمية مهارات وصعوبات تعلم',
      desc: [
        'جلسات فردية بإشراف مختصين',
        'تنمية مهارات الطلاب المختلفة',
        'دعم حالات الدمج والتوحد',
      ],
    },
    {
      title: 'تطوير مهارات التفكير والإبداع',
      desc: [
        'تعزيز التفكير النقدي',
        'تنمية القدرة على حل المشكلات',
        'تشجيع الإبداع في التعلم',
      ],
    },
    {
      title: 'ورش وأنشطة تفاعلية',
      desc: [
        'فعاليات تعليمية ممتعة',
        'تعلم عملي وتجريبي',
        'أنشطة تشجع التعاون والعمل الجماعي',
      ],
    },
    {
      title: 'تقنيات تعليمية حديثة',
      desc: [
        'استخدام أدوات تعليمية رقمية متطورة',
        'تعلم عبر منصات تعليمية حديثة',
        'تجربة تعليمية تفاعلية وذكية',
      ],
    },
    {
      title: 'إعداد للامتحانات والاختبارات',
      desc: [
        'متابعة دقيقة لأداء الطلاب',
        'دروس دعم وتحضير للامتحانات',
        'رفع ثقة الطالب قبل الاختبارات',
      ],
    },
    {
      title: 'دورات في جميع المناهج الدراسية',
      desc: [
        'دورات متخصصة في المواد الأساسية',
        'تعزيز التفوق الأكاديمي للطلاب',
        'تنمية مهارات حل المسائل والتفكير التحليلي',
      ],
    },
    {
      title: 'بيئة داعمة تعزز الإبداع',
      desc: [
        'تشجيع التفكير النقدي',
        'تعزيز قدرات الطلاب الإبداعية',
        'خلق جو تعليمي محفز ومشجع',
      ],
    },
  ];
}
