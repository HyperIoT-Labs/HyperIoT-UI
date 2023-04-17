import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTextAreaComponent } from './hyt-text-area.component';

describe('HytTextAreaComponent', () => {
  let component: HytTextAreaComponent;
  let fixture: ComponentFixture<HytTextAreaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
