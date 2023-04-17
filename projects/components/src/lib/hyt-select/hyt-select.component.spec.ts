import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytSelectComponent } from './hyt-select.component';

describe('HytSelectComponent', () => {
  let component: HytSelectComponent;
  let fixture: ComponentFixture<HytSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
