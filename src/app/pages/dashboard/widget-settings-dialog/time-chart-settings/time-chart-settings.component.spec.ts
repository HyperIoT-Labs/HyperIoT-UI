import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeChartSettingsComponent } from './time-chart-settings.component';

describe('TimeChartSettingsComponent', () => {
  let component: TimeChartSettingsComponent;
  let fixture: ComponentFixture<TimeChartSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeChartSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeChartSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
