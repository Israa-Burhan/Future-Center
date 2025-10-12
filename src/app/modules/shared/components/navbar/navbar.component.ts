import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
export class NavbarComponent {
  sidebarVisible: boolean = false;

  constructor() {}
  navLinks = [
    { label: 'الرئيسية', route: '' },
    { label: 'المعلمين', route: '/', fragment: 'teachers' },
    { label: 'تواصل معنا', route: '/contact' },
    { label: 'الاسئلة الشائعة', route: '/faq' },
  ];
}
