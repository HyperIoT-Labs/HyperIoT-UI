import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningComponent } from './machinelearning.component';

describe('MachineLearningComponent', () => {
  let component: MachineLearningComponent;
  let fixture: ComponentFixture<MachineLearningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
