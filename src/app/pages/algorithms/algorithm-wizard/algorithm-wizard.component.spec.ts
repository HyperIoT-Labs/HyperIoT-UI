import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmWizardComponent } from './algorithm-wizard.component';

describe('AlgorithmWizardComponent', () => {
  let component: AlgorithmWizardComponent;
  let fixture: ComponentFixture<AlgorithmWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
