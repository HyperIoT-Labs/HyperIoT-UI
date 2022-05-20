import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAlarmsFormComponent } from './project-alarms-form.component';

describe('ProjectAlarmsFormComponent', () => {
  let component: ProjectAlarmsFormComponent;
  let fixture: ComponentFixture<ProjectAlarmsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectAlarmsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectAlarmsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
