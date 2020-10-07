import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatisticsFormComponent } from './project-statistics-form.component';

describe('ProjectStatisticsFormComponent', () => {
  let component: ProjectStatisticsFormComponent;
  let fixture: ComponentFixture<ProjectStatisticsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectStatisticsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStatisticsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
