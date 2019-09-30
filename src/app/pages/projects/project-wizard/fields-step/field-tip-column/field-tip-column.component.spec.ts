import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldTipColumnComponent } from './field-tip-column.component';

describe('FieldTipColumnComponent', () => {
  let component: FieldTipColumnComponent;
  let fixture: ComponentFixture<FieldTipColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldTipColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldTipColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
