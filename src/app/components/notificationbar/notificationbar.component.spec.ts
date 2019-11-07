import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationbarComponent } from './notificationbar.component';

describe('NotificationbarComponent', () => {
  let component: NotificationbarComponent;
  let fixture: ComponentFixture<NotificationbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
