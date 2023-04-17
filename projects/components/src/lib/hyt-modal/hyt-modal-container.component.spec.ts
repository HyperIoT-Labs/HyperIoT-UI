import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytModalContainerComponent } from './hyt-modal-container.component';

describe('HytModalComponent', () => {
  let component: HytModalContainerComponent;
  let fixture: ComponentFixture<HytModalContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytModalContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
