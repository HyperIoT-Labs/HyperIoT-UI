import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleErrorModalComponent } from './rule-error-modal.component';

describe('RuleErrorModalComponent', () => {
  let component: RuleErrorModalComponent;
  let fixture: ComponentFixture<RuleErrorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleErrorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
