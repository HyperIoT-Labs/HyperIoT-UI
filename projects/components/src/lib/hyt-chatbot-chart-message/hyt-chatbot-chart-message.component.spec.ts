import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HytChatbotChartMessageComponent } from './hyt-chatbot-chart-message.component';

describe('HytChatbotComponent', () => {
  let component: HytChatbotChartMessageComponent;
  let fixture: ComponentFixture<HytChatbotChartMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HytChatbotChartMessageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytChatbotChartMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
