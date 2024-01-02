import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytChatbotComponent } from './hyt-chatbot.component';

describe('HytChatbotComponent', () => {
  let component: HytChatbotComponent;
  let fixture: ComponentFixture<HytChatbotComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HytChatbotComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
