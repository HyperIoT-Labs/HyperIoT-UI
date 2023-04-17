import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytInfoRecordingActionComponent } from './hyt-info-recording-action.component';

describe('InfoRecordingActionComponent', () => {
  let component: HytInfoRecordingActionComponent;
  let fixture: ComponentFixture<HytInfoRecordingActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytInfoRecordingActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytInfoRecordingActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
