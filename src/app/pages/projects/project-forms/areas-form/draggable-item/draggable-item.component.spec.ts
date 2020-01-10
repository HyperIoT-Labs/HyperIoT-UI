import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableItemComponent } from './draggable-item.component';

describe('DraggableItemComponent', () => {
  let component: DraggableItemComponent;
  let fixture: ComponentFixture<DraggableItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
