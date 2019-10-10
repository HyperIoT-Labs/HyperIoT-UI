import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsChartSettingsComponent } from './stats-chart-settings.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('StatsChartSettingsComponent', () => {
  let component: StatsChartSettingsComponent;
  let fixture: ComponentFixture<StatsChartSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatsChartSettingsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
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
