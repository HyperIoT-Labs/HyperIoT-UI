import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTreeViewCategoryComponent } from './hyt-tree-view-category.component';

describe('HytTreeViewCategoryComponent', () => {
  let component: HytTreeViewCategoryComponent;
  let fixture: ComponentFixture<HytTreeViewCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTreeViewCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTreeViewCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
