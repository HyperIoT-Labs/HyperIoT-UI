import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTreeViewEditableComponent } from './hyt-tree-view-editable.component';

describe('HytTreeViewEditableComponent', () => {
  let component: HytTreeViewEditableComponent;
  let fixture: ComponentFixture<HytTreeViewEditableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTreeViewEditableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTreeViewEditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
