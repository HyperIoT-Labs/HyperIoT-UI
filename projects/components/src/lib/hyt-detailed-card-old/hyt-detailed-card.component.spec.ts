import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytDetailedCardComponent } from './hyt-detailed-card.component';

describe('HytDetailedCardComponent', () => {
  let component: HytDetailedCardComponent;
  let fixture: ComponentFixture<HytDetailedCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytDetailedCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytDetailedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
