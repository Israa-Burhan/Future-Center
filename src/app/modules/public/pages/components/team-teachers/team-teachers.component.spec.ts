import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTeachersComponent } from './team-teachers.component';

describe('TeamTeachersComponent', () => {
  let component: TeamTeachersComponent;
  let fixture: ComponentFixture<TeamTeachersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTeachersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeamTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
