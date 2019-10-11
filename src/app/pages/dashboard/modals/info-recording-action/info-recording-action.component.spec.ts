import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRecordingActionComponent } from './info-recording-action.component';

describe('InfoRecordingActionComponent', () => {
  let component: InfoRecordingActionComponent;
  let fixture: ComponentFixture<InfoRecordingActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoRecordingActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoRecordingActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
