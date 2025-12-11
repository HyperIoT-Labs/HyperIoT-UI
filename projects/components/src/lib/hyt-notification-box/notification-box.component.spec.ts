import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HytNotificationBoxComponent} from "components";

describe('NotificationBoxComponent', () => {
  let component: HytNotificationBoxComponent;
  let fixture: ComponentFixture<HytNotificationBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytNotificationBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytNotificationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
