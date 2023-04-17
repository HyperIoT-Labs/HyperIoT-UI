import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PickerPopUpComponent } from './picker-pop-up.component';

describe('PickerPopUpComponent', () => {
  let component: PickerPopUpComponent;
  let fixture: ComponentFixture<PickerPopUpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PickerPopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickerPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
