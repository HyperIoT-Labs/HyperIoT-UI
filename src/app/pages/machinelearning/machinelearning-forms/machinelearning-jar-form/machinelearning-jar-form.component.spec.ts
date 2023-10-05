import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineLearningJarFormComponent } from './machinelearning-jar-form.component';

describe('AlgorithmJarFormComponent', () => {
  let component: MachineLearningJarFormComponent;
  let fixture: ComponentFixture<MachineLearningJarFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineLearningJarFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineLearningJarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
