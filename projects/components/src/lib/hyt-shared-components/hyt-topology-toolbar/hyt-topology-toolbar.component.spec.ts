import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTopologyToolbarComponent } from './hyt-topology-toolbar.component';

describe('HytTopologyToolbarComponent', () => {
  let component: HytTopologyToolbarComponent;
  let fixture: ComponentFixture<HytTopologyToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTopologyToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTopologyToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
