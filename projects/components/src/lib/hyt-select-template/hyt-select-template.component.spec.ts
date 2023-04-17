import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytSelectTemplateComponent } from './hyt-select-template.component';

describe('HytSelectTemplateComponent', () => {
  let component: HytSelectTemplateComponent;
  let fixture: ComponentFixture<HytSelectTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytSelectTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytSelectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
