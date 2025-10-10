import { NavbarComponent } from './../../shared/components/navbar/navbar.component';
import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { BackToUpComponent } from '../../shared/components/back-to-up/back-to-up.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet, BackToUpComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {}
