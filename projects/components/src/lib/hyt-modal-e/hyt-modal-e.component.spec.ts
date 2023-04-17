import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytModalEComponent } from './hyt-modal-e.component';

describe('HytModalComponent', () => {
  let component: HytModalEComponent;
  let fixture: ComponentFixture<HytModalEComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytModalEComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytModalEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
