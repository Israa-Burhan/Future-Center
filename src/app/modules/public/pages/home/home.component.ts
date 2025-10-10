import { Component } from '@angular/core';
import { BannerSectionComponent } from '../components/banner-section/banner-section.component';
import { FeaturesComponent } from '../components/features/features.component';
import { LearningExperienceComponent } from '../components/learning-experience/learning-experience.component';
import { TeamTeachersComponent } from '../components/team-teachers/team-teachers.component';
import { SubjectsComponent } from '../components/subjects/subjects.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BannerSectionComponent,
    FeaturesComponent,
    LearningExperienceComponent,
    TeamTeachersComponent,
    SubjectsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
