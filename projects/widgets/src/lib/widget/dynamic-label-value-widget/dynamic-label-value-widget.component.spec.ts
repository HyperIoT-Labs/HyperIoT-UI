import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicLabelValueWidgetComponent } from './dynamic-label-value-widget.component';

describe('DynamicLabelValueWidgetComponent', () => {
  let component: DynamicLabelValueWidgetComponent;
  let fixture: ComponentFixture<DynamicLabelValueWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicLabelValueWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicLabelValueWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
