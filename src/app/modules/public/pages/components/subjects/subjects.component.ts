import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
interface Subject {
  src: string;
  alt: string;
}
@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.scss',
})
export class SubjectsComponent {
  subjects: Subject[] = [
    {
      src: '../../../../../../assets/images/subjects/عربي.png',
      alt: 'اللغة العربية',
    },
    {
      src: '../../../../../../assets/images/subjects/انجليزي.png',
      alt: 'اللغة الإنجليزية',
    },
    {
      src: '../../../../../../assets/images/subjects/الرياضيات.png',
      alt: 'الرياضيات',
    },
    {
      src: '../../../../../../assets/images/subjects/اجتماعيات.png',
      alt: 'اجتماعيات',
    },
    {
      src: '../../../../../../assets/images/subjects/العلوم.png',
      alt: 'العلوم',
    },
    {
      src: '../../../../../../assets/images/subjects/الفيزياء.png',
      alt: 'الفيزياء',
    },
    {
      src: '../../../../../../assets/images/subjects/الكيمياء.png',
      alt: 'الكيمياء',
    },
    {
      src: '../../../../../../assets/images/subjects/اسلامية.png',
      alt: 'اسلامية',
    },
  ];

  specialists: Subject[] = [
    {
      src: '../../../../../../assets/images/subjects/تنمية مهارات.png',
      alt: 'أخصائي نفسي تربوي',
    },
    {
      src: '../../../../../../assets/images/subjects/حالات دمج.png',
      alt: 'أخصائي نطق وتخاطب',
    },
  ];
}
