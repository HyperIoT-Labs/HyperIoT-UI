import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardDeactivationModalComponent } from './wizard-deactivation-modal.component';

describe('WizardDeactivationModalComponent', () => {
  let component: WizardDeactivationModalComponent;
  let fixture: ComponentFixture<WizardDeactivationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardDeactivationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardDeactivationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
