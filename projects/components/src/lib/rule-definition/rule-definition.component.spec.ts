import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleDefinitionComponent } from './rule-definition.component';

describe('RuleDefinitionComponent', () => {
  let component: RuleDefinitionComponent;
  let fixture: ComponentFixture<RuleDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
