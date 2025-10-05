import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonEngine } from '@angular/ssr';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  navLinks = [
    { label: 'الصفحة الرئيسية', route: '/home' },
    { label: 'المعلمين', route: '/teachers' },
    { label: 'تواصل معنا', route: '/contact' },
    { label: 'الاسئلة الشائعة', route: '/faq' },
  ];
}
