import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataExportNotificationButtonComponent } from './data-export-notification-button.component';

describe('DataExportNotificationButtonComponent', () => {
  let component: DataExportNotificationButtonComponent;
  let fixture: ComponentFixture<DataExportNotificationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataExportNotificationButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataExportNotificationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
