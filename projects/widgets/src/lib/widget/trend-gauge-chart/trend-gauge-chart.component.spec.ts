import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendGaugeChartComponent } from './trend-gauge-chart.component';

describe('TrendGaugeChartComponent', () => {
  let component: TrendGaugeChartComponent;
  let fixture: ComponentFixture<TrendGaugeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendGaugeChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendGaugeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
