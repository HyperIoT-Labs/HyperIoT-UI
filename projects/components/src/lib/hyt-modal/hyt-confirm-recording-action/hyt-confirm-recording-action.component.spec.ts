import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytConfirmRecordingActionComponent } from './hyt-confirm-recording-action.component';

describe('ConfirmRecordingActionComponent', () => {
  let component: HytConfirmRecordingActionComponent;
  let fixture: ComponentFixture<HytConfirmRecordingActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytConfirmRecordingActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytConfirmRecordingActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
