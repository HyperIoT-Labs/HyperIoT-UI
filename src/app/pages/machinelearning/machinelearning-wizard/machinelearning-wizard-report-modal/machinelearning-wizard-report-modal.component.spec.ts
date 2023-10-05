import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningWizardReportModalComponent } from './machinelearning-wizard-report-modal.component';

describe('MachineLearningWizardReportModalComponent', () => {
  let component: MachineLearningWizardReportModalComponent;
  let fixture: ComponentFixture<MachineLearningWizardReportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningWizardReportModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningWizardReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
