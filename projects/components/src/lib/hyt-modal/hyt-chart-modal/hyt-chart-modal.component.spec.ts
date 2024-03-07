import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytChartModalComponent } from './hyt-chart-modal.component';

describe('HytInfoRecordingActionComponent', () => {
  let component: HytChartModalComponent;
  let fixture: ComponentFixture<HytChartModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytChartModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytChartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
