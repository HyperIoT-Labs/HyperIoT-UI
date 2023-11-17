import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSimulatorSettingsComponent } from './data-simulator-settings.component';

describe('DataSimulatorSettingsComponent', () => {
  let component: DataSimulatorSettingsComponent;
  let fixture: ComponentFixture<DataSimulatorSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSimulatorSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSimulatorSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
