import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDeviceInfoComponent } from './map-device-info.component';

describe('MapDeviceInfoComponent', () => {
  let component: MapDeviceInfoComponent;
  let fixture: ComponentFixture<MapDeviceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapDeviceInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDeviceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
