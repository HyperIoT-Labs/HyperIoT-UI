import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytIconPickerListComponent } from './hyt-icon-picker-list.component';

describe('HytIconPickerListComponent', () => {
  let component: HytIconPickerListComponent;
  let fixture: ComponentFixture<HytIconPickerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytIconPickerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytIconPickerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
