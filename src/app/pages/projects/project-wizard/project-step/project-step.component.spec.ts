import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStepComponent } from './project-step.component';

describe('ProjectStepComponent', () => {
  let component: ProjectStepComponent;
  let fixture: ComponentFixture<ProjectStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
