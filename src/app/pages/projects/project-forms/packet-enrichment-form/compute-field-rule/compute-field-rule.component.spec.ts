import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputeFieldRuleComponent } from './compute-field-rule.component';

describe('ComputeFieldRuleComponent', () => {
  let component: ComputeFieldRuleComponent;
  let fixture: ComponentFixture<ComputeFieldRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComputeFieldRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputeFieldRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
