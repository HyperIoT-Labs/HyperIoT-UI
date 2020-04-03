import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FourierChartSettingsComponent } from './fourier-chart-settings.component';

describe('FourierChartSettingsComponent', () => {
  let component: FourierChartSettingsComponent;
  let fixture: ComponentFixture<FourierChartSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FourierChartSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FourierChartSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
