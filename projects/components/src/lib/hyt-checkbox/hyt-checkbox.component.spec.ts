import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HCheckboxComponent } from './hyt-checkbox.component';

describe('HCheckboxComponent', () => {
  let component: HCheckboxComponent;
  let fixture: ComponentFixture<HCheckboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HCheckboxComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
