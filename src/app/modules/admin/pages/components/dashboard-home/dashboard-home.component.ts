import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
interface StatCard {
  id: string;
  title: string;
  value: string;
  delta: string;
  deltaClass: 'up' | 'down';
  icon: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent {
  statCards: StatCard[] = [];

  ngOnInit(): void {
    // API لاحقًا
    this.statCards = [
      {
        id: 'totalStudents',
        title: 'عدد الطلاب الكلي',
        value: '5,000',
        delta: '+2.3%',
        deltaClass: 'up',
        icon: 'pi pi-users',
      },
      {
        id: 'newStudents',
        title: 'عدد الطلاب الجدد',
        value: '500',
        delta: '-3.2%',
        deltaClass: 'down',
        icon: 'pi pi-user-plus',
      },
      {
        id: 'instructors',
        title: 'عدد المحاضرين',
        value: '700',
        delta: '+1.8%',
        deltaClass: 'up',
        icon: 'pi pi-briefcase',
      },
      {
        id: 'revenue',
        title: 'معدل الزيادة المالية',
        value: '50,000 ريال',
        delta: '+3.0%',
        deltaClass: 'up',
        icon: 'pi pi-wallet',
      },
    ];
  }
}
