import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsStepComponent } from './fields-step.component';

describe('FieldsStepComponent', () => {
  let component: FieldsStepComponent;
  let fixture: ComponentFixture<FieldsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
