import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytIconPickerComponent } from './hyt-icon-picker.component';

describe('HytIconPickerComponent', () => {
  let component: HytIconPickerComponent;
  let fixture: ComponentFixture<HytIconPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytIconPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytIconPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
