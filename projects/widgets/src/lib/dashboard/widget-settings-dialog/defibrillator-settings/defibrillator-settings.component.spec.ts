import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefibrillatorSettingsComponent } from './defibrillator-settings.component';

describe('DefibrillatorSettingsComponent', () => {
  let component: DefibrillatorSettingsComponent;
  let fixture: ComponentFixture<DefibrillatorSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefibrillatorSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefibrillatorSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
