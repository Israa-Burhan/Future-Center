import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    SidebarModule,
    CommonModule,
    ButtonModule,
    DividerModule,
    RippleModule,
    FormsModule,
    RouterModule,
    ToggleButtonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  sidebarVisible: boolean = false;
  isAuthenticated: boolean = false;
  loggingOut: boolean = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}
  navLinks = [
    { label: 'الرئيسية', route: '' },
    { label: 'المعلمين', route: '/', fragment: 'teachers' },
    { label: 'تواصل معنا', route: '/contact' },
    { label: 'الاسئلة الشائعة', route: '/faq' },
  ];

  ngOnInit(): void {
    this.auth.getSession().then((session) => {
      this.isAuthenticated = !!session;
    });
  }

  async logout() {
    this.loggingOut = true;
    try {
      await this.auth.logout();
      this.isAuthenticated = false;
      await this.router.navigate(['/login']);
    } finally {
      this.loggingOut = false;
      this.sidebarVisible = false;
    }
  }
}
