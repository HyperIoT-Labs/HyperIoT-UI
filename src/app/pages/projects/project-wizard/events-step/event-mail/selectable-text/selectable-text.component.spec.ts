import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableTextComponent } from './selectable-text.component';

describe('SelectableTextComponent', () => {
  let component: SelectableTextComponent;
  let fixture: ComponentFixture<SelectableTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectableTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
