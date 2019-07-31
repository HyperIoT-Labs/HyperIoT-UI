import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsChartSettingsComponent } from './stats-chart-settings.component';

describe('StatsChartSettingsComponent', () => {
  let component: StatsChartSettingsComponent;
  let fixture: ComponentFixture<StatsChartSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatsChartSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsChartSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
