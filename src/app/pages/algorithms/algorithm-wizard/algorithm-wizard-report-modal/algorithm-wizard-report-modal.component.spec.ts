import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmWizardReportModalComponent } from './algorithm-wizard-report-modal.component';

describe('AlgorithmWizardReportModalComponent', () => {
  let component: AlgorithmWizardReportModalComponent;
  let fixture: ComponentFixture<AlgorithmWizardReportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmWizardReportModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmWizardReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
