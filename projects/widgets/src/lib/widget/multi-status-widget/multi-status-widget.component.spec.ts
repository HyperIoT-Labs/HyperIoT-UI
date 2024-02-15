import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiStatusWidgetComponent } from './multi-status-widget.component';

describe('MultiStatusWidgetComponent', () => {
  let component: MultiStatusWidgetComponent;
  let fixture: ComponentFixture<MultiStatusWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiStatusWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiStatusWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
