import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningWizardComponent } from './machinelearning-wizard.component';

describe('AlgorithmWizardComponent', () => {
  let component: MachineLearningWizardComponent;
  let fixture: ComponentFixture<MachineLearningWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
