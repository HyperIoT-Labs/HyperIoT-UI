import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDeviceEditComponent } from './map-device-edit.component';

describe('MapDeviceEditComponent', () => {
  let component: MapDeviceEditComponent;
  let fixture: ComponentFixture<MapDeviceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapDeviceEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDeviceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
