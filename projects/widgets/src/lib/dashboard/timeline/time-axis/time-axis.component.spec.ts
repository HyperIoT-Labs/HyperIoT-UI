import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { TimeAxisComponent } from './time-axis.component';

describe('TimeAxisComponent', () => {
  let component: TimeAxisComponent;
  let fixture: ComponentFixture<TimeAxisComponent>;

  beforeEach(waitForAsync(() => {
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
