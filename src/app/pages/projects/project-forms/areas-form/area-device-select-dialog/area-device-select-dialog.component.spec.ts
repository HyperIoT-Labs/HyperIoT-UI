import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDeviceSelectDialogComponent } from './area-device-select-dialog.component';

describe('AreaDeviceSelectDialogComponent', () => {
  let component: AreaDeviceSelectDialogComponent;
  let fixture: ComponentFixture<AreaDeviceSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaDeviceSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaDeviceSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
