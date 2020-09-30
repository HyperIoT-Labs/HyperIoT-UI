import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFieldsFormComponent } from './input-fields-form.component';

describe('InputFieldsFormComponent', () => {
  let component: InputFieldsFormComponent;
  let fixture: ComponentFixture<InputFieldsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputFieldsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
