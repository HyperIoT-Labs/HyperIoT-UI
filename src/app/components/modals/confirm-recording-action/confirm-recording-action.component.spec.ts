import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRecordingActionComponent } from './confirm-recording-action.component';

describe('ConfirmRecordingActionComponent', () => {
  let component: ConfirmRecordingActionComponent;
  let fixture: ComponentFixture<ConfirmRecordingActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmRecordingActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRecordingActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
