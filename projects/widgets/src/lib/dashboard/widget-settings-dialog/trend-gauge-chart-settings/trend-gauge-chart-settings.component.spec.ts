import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendGaugeChartSettingsComponent } from './trend-gauge-chart-settings.component';

describe('TrendGaugeChartSettingsComponent', () => {
  let component: TrendGaugeChartSettingsComponent;
  let fixture: ComponentFixture<TrendGaugeChartSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendGaugeChartSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendGaugeChartSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
