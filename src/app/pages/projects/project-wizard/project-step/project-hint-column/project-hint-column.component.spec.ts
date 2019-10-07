import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHintColumnComponent } from './project-hint-column.component';

describe('ProjectHintColumnComponent', () => {
  let component: ProjectHintColumnComponent;
  let fixture: ComponentFixture<ProjectHintColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectHintColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectHintColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
