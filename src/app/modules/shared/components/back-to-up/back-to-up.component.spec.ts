import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackToUpComponent } from './back-to-up.component';

describe('BackToUpComponent', () => {
  let component: BackToUpComponent;
  let fixture: ComponentFixture<BackToUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackToUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BackToUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
