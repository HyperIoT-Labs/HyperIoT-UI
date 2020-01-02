import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAxisComponent } from './time-axis.component';

describe('TimeAxisComponent', () => {
  let component: TimeAxisComponent;
  let fixture: ComponentFixture<TimeAxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeAxisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
