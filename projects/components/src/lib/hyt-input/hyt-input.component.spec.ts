import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytInputComponent } from './hyt-input.component';

describe('HInputComponent', () => {
  let component: HytInputComponent;
  let fixture: ComponentFixture<HytInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HytInputComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
