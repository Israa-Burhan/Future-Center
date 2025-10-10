import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-back-to-up',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './back-to-up.component.html',
  styleUrl: './back-to-up.component.scss',
})
export class BackToUpComponent {
  showButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    this.showButton = scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
