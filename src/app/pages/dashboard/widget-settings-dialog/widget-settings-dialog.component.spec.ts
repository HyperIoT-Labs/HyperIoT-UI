import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSettingsDialogComponent } from './widget-settings-dialog.component';

describe('WidgetSettingsDialogComponent', () => {
  let component: WidgetSettingsDialogComponent;
  let fixture: ComponentFixture<WidgetSettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
