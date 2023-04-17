import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HButtonComponent } from './hyt-button.component';

describe('HBottonComponent', () => {
  let component: HButtonComponent;
  let fixture: ComponentFixture<HButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HButtonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
