import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetFullscreenDialogComponent } from './widget-fullscreen-dialog.component';

describe('WidgetFullscreenDialogComponent', () => {
  let component: WidgetFullscreenDialogComponent;
  let fixture: ComponentFixture<WidgetFullscreenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetFullscreenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetFullscreenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
