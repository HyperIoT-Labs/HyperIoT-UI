import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputFieldsFormComponent } from './output-fields-form.component';

describe('OutputFieldsFormComponent', () => {
  let component: OutputFieldsFormComponent;
  let fixture: ComponentFixture<OutputFieldsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputFieldsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
