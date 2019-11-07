import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardReportModalComponent } from './wizard-report-modal.component';

describe('WizardReportModalComponent', () => {
  let component: WizardReportModalComponent;
  let fixture: ComponentFixture<WizardReportModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardReportModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
