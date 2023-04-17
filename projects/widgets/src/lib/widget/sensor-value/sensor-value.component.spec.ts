import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorValueComponent } from './sensor-value.component';

describe('SensorValueComponent', () => {
  let component: SensorValueComponent;
  let fixture: ComponentFixture<SensorValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
