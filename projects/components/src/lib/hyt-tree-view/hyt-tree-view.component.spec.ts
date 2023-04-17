import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTreeViewComponent } from './hyt-tree-view.component';

describe('HytTreeViewComponent', () => {
  let component: HytTreeViewComponent;
  let fixture: ComponentFixture<HytTreeViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTreeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
