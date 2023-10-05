import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningInfoFormComponent } from './machinelearning-info-form.component';

describe('MachineLearningInfoFormComponent', () => {
  let component: MachineLearningInfoFormComponent;
  let fixture: ComponentFixture<MachineLearningInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
