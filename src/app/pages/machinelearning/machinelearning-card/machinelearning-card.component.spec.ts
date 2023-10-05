import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningCardComponent } from './machinelearning-card.component';

describe('AlgorithmCardComponent', () => {
  let component: MachineLearningCardComponent;
  let fixture: ComponentFixture<MachineLearningCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
