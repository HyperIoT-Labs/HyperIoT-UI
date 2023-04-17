import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytLazyPaginationTableComponent } from './hyt-lazy-pagination-table.component';

describe('HytLazyPaginationTableComponent', () => {
  let component: HytLazyPaginationTableComponent;
  let fixture: ComponentFixture<HytLazyPaginationTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytLazyPaginationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytLazyPaginationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
