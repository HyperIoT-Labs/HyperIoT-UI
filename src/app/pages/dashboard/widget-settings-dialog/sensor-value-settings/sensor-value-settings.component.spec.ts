import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorValueSettingsComponent } from './sensor-value-settings.component';

describe('SensorValueSettingsComponent', () => {
  let component: SensorValueSettingsComponent;
  let fixture: ComponentFixture<SensorValueSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorValueSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorValueSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
