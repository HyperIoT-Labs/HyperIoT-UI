import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { BodymapComponent } from './bodymap.component';

describe('HpacketTableComponent', () => {
  let component: BodymapComponent;
  let fixture: ComponentFixture<BodymapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BodymapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodymapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
