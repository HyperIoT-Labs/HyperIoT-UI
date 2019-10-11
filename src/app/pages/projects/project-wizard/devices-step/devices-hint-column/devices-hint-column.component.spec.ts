import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesHintColumnComponent } from './devices-hint-column.component';

describe('DevicesHintColumnComponent', () => {
  let component: DevicesHintColumnComponent;
  let fixture: ComponentFixture<DevicesHintColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicesHintColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesHintColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
