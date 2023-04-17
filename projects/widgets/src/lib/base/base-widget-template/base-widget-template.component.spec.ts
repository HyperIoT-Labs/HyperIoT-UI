import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWidgetTemplateComponent } from './base-widget-template.component';

describe('BaseWidgetTemplateComponent', () => {
  let component: BaseWidgetTemplateComponent;
  let fixture: ComponentFixture<BaseWidgetTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseWidgetTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseWidgetTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
