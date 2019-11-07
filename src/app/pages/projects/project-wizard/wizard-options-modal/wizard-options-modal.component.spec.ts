import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardOptionsModalComponent } from './wizard-options-modal.component';

describe('WizardOptionsModalComponent', () => {
  let component: WizardOptionsModalComponent;
  let fixture: ComponentFixture<WizardOptionsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardOptionsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
