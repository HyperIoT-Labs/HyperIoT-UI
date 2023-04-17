import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytGenericMessageDialogComponent } from './hyt-generic-message-dialog.component';

describe('GenericMessageDialogComponent', () => {
  let component: HytGenericMessageDialogComponent;
  let fixture: ComponentFixture<HytGenericMessageDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytGenericMessageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytGenericMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
