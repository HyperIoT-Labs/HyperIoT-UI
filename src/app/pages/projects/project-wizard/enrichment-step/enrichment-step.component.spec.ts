import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentStepComponent } from './enrichment-step.component';

describe('EnrichmentStepComponent', () => {
  let component: EnrichmentStepComponent;
  let fixture: ComponentFixture<EnrichmentStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
