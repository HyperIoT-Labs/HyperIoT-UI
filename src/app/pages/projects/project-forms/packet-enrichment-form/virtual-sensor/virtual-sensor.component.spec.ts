import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualSensorComponent } from './virtual-sensor.component';

describe('VirtualSensorComponent', () => {
  let component: VirtualSensorComponent;
  let fixture: ComponentFixture<VirtualSensorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VirtualSensorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
