import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPriceSummaryComponent } from './student-price-summary.component';

describe('StudentPriceSummaryComponent', () => {
  let component: StudentPriceSummaryComponent;
  let fixture: ComponentFixture<StudentPriceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPriceSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentPriceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
